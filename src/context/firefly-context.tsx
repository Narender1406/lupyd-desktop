"use client"

import { FireflyWsClient, protos as FireflyProtos, FireflyService, newJsSessionStore, newJsPreKeyStore, newJsSignedPreKeyStore, newJsKyberPreKeyStore, newJsIdentityStore, libsignal, newJsSessionStoreExposed, newJsPreKeyStoreExposed, newJsSignedPreKeyStoreExposed, newJsKyberPreKeyStoreExposed, newJsIdentityStoreExposed } from "firefly-client-js"
import { createContext, type ReactNode, useContext, useRef, useEffect, useState, useMemo } from "react"

import { useAuth } from "./auth-context"
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";
type MessageCallbackType = (client: FireflyWsClient, message: FireflyProtos.ServerMessage) => void;

type FireflyContextType = {
  client: FireflyWsClient,
  service: FireflyService,
  addEventListener: (cb: MessageCallbackType) => void,
  removeEventListener: (cb: MessageCallbackType) => void,

  initialize: () => Promise<void>,
  dispose: () => void,

  encrypt: (payload: Uint8Array, other: string) => Promise<{ cipherText: Uint8Array, cipherType: number }>,
  decrypt: (cipherText: Uint8Array, cipherType: number, from: string) => Promise<Uint8Array>,
  processPreKeyBundle: (other: string, bundle: FireflyProtos.PreKeyBundle) => Promise<void>
  getConversation: (other: string) => Promise<FireflyProtos.Conversation>
}


const FireflyContext = createContext<FireflyContextType | undefined>(undefined)




export default function FireflyProvider() {
  const auth = useAuth()


  const eventListeners = useRef(new Set<MessageCallbackType>())


  const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_API_URL
  const websocketUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_WEBSOCKET_URL


  if (typeof apiUrl !== "string" || typeof websocketUrl !== "string") {
    throw new Error(`Missing CHAT ENV VARS`)
  }

  const sessionStore = newJsSessionStoreExposed()
  const preKeyStore = newJsPreKeyStoreExposed()
  const signedPreKeyStore = newJsSignedPreKeyStoreExposed()
  const kyberPreKeyStore = newJsKyberPreKeyStoreExposed()
  const identityStore = newJsIdentityStoreExposed()

  useEffect(() => () => {
    sessionStore.sessionStore.free()
    preKeyStore.preKeyStore.free()
    signedPreKeyStore.signedPreKeyStore.free()
    kyberPreKeyStore.kyberPreKeyStore.free()
    identityStore.identityStore.free()
  }, [])

  const buildClient = () =>
    new FireflyWsClient(websocketUrl, async () => {
      const token = await auth.getToken(); if (!token) {
        throw Error(`Not authenticated`)
      } else {
        return token
      }
    }, onMessageCallback, () => {
      console.error(`Retrying failed`)
    });
  const [client, _] = useState<FireflyWsClient>(buildClient())
  const service = useMemo(() => new FireflyService(apiUrl, async () => {
    if (!auth.username) throw Error(`Not authenticated`);
    const token = await auth.getToken(); if (!token) {
      throw Error(`Not authenticated`)
    } else {
      return token
    }
  }), [auth])

  useEffect(() => {
    return () => { client.dispose(); };
  }, [])

  useEffect(() => {
    if (auth.username) {
      client!.initialize().then(() => console.log(`Firefly initialized`)).catch(console.error);
    }

  }, [auth])

  async function encrypt(payload: Uint8Array, other: string) {
    const addr = new libsignal.ProtocolAddress(other, 1)
    try {
      const message = await libsignal.signalEncrypt(payload, addr, sessionStore.sessionStore, identityStore.identityStore, BigInt(Date.now()));

      const cipherText = message.serialize()
      const cipherType = message.type()
      message.free()
      addr.free()
      return { cipherText, cipherType }
    } catch (err) {
      addr.free()
      throw err
    }

  }

  async function decrypt(cipherText: Uint8Array, cipherType: number, from: string) {
    const addr = new libsignal.ProtocolAddress(from, 1)

    const toFree: { free: () => void; }[] = [addr]
    let deciphered = new Uint8Array()

    try {
      switch (cipherType) {

        case libsignal.CiphertextMessageType.PreKey: {
          const message = libsignal.PreKeySignalMessage.deserialize(cipherText);
          toFree.push(message);
          const result = await libsignal.signalDecryptPreKey(message, addr, sessionStore.sessionStore, identityStore.identityStore,
            preKeyStore.preKeyStore, signedPreKeyStore.signedPreKeyStore, kyberPreKeyStore.kyberPreKeyStore, libsignal.UsePQRatchet.Yes)
          deciphered = new Uint8Array(result);
          break

        }
        case libsignal.CiphertextMessageType.Whisper: {
          const message = libsignal.SignalMessage.deserialize(cipherText)
          toFree.push(message)
          const result = await libsignal.signalDecrypt(
            message,
            addr,
            sessionStore.sessionStore,
            identityStore.identityStore,
          );
          deciphered = new Uint8Array(result);
          break
        }
        default: {

        }
      }
    } catch (err) {
      toFree.forEach(e => e.free())
      throw err
    }

    toFree.forEach(e => e.free())
    return deciphered

  }

  async function processPreKeyBundle(other: string, bundle: FireflyProtos.PreKeyBundle) {
    const toFree: { free: () => void; }[] = []
    try {
      const addr = new libsignal.ProtocolAddress(other, 1)
      toFree.push(addr)
      const prePublicKey = libsignal.PublicKey.deserialize(bundle!.prePublicKey)
      toFree.push(prePublicKey)
      const signedPrePublicKey = libsignal.PublicKey.deserialize(bundle!.signedPrePublicKey)
      toFree.push(signedPrePublicKey)
      const identityPublicKey = libsignal.PublicKey.deserialize(bundle!.identityPublicKey)
      toFree.push(identityPublicKey)
      const KEMPrePublicKey = libsignal.KEMPublicKey.deserialize(bundle!.KEMPrePublicKey)
      toFree.push(KEMPrePublicKey)
      const preKeyBundle = new libsignal.PreKeyBundle(
        bundle!.registrationId,
        bundle!.deviceId,
        bundle!.preKeyId,
        prePublicKey,
        bundle!.signedPreKeyId,
        signedPrePublicKey,
        bundle!.signedPreKeySignature,
        identityPublicKey,
        bundle!.KEMPreKeyId,
        KEMPrePublicKey,
        bundle!.KEMPreKeySignature,
      );

      toFree.push(preKeyBundle)

      await libsignal.processPreKeyBundle(preKeyBundle, addr, sessionStore.sessionStore, identityStore.identityStore, libsignal.UsePQRatchet.Yes, BigInt(Date.now()))

    } catch (err) {
      toFree.forEach(e => e.free())
      throw err
    }

    toFree.forEach(e => e.free())

  }


  async function checkSelfBundles() {
    const bundles = await service.getPreKeyBundles();
    const bundleIdsToDelete: number[] = []
    for (const bundle of bundles.bundles) {

      const result = await preKeyStore.store.get(bundle.preKeyId.toString());

      if (!(result && result instanceof Uint8Array)) {
        bundleIdsToDelete.push(bundle.preKeyId)
      }
    }

    if (bundleIdsToDelete.length > 0) {
      await service.deletePreKeyBundles(bundleIdsToDelete)
    }

    if (bundles.bundles.length - bundleIdsToDelete.length < 16) {
      const toFree: { free: () => void; }[] = []
      const randInt = () => Math.floor(Math.random() * 9999)
      const registrationId = 1;
      const deviceId = 1;

      try {
        const identityKey =
          libsignal.IdentityKeyPairWrapper.deserialize(await identityStore.get_identity_key_handler());
        toFree.push(identityKey)
        const identityPublicKey = identityKey.getPublicKey();
        toFree.push(identityPublicKey)

        const newBundles = FireflyProtos.PreKeyBundles.create()

        for (let i = 0; i < 16 - (bundles.bundles.length - bundleIdsToDelete.length); i++) {
          const preKeyId = randInt()
          const signedPreKeyId = randInt()
          const KEMPreKeyId = randInt()

          const KEMPreKey = libsignal.KEMKeyPair.generate();
          toFree.push(KEMPreKey)

          const KEMPublicKey = KEMPreKey.getPublicKey();
          toFree.push(KEMPublicKey)

          const KEMPreKeySignature = identityKey.sign(KEMPublicKey.serialize());

          const preKey = libsignal.PrivateKey.generate();
          toFree.push(preKey)
          const sPreKey = libsignal.PrivateKey.generate();
          toFree.push(sPreKey)

          const sPrePublicKey = sPreKey.getPublicKey();
          toFree.push(sPrePublicKey)

          const signedPreKeySignature = identityKey.sign(
            sPrePublicKey.serialize(),
          );

          const prePublicKey = preKey.getPublicKey();
          toFree.push(prePublicKey)

          const bundle = FireflyProtos.PreKeyBundle.create({
            preKeyId, KEMPreKeyId,
            signedPreKeyId,
            KEMPreKeySignature,
            signedPreKeySignature,
            signedPrePublicKey: sPrePublicKey.serialize(),
            prePublicKey: prePublicKey.serialize(),
            KEMPrePublicKey: KEMPublicKey.serialize(),
            identityPublicKey: identityPublicKey.serialize(),
            deviceId,
            registrationId,
          })

          {
            const record = new libsignal.PreKeyRecord(
              preKeyId,
              preKey.getPublicKey(),
              preKey,
            );
            toFree.push(record)
            await preKeyStore.store_pre_key_handler(preKeyId.toString(), record.serialize());
          }

          {
            const record = new libsignal.SignedPreKeyRecord(
              signedPreKeyId,
              BigInt(Date.now()),
              sPreKey.getPublicKey(),
              sPreKey,
              signedPreKeySignature,
            );
            toFree.push(record)
            await signedPreKeyStore.store_signed_pre_key_handler(signedPreKeyId.toString(), record.serialize());

          }
          {
            const record = new libsignal.KyberPreKeyRecord(
              KEMPreKeyId,
              BigInt(Date.now()),
              KEMPreKey,
              KEMPreKeySignature,
            );
            toFree.push(record)
            await kyberPreKeyStore.store_kyber_pre_key_handler(KEMPreKeyId.toString(), record.serialize(),

            );
          }

          newBundles.bundles.push(bundle)
        }

        await service.uploadPreKeyBundles(newBundles);
      } catch (err) {
        toFree.forEach(e => e.free())
        throw err
      }

      toFree.forEach(e => e.free())
    }
  }

  async function getConversation(other: string) {
    return service.getConversation(other).then((conv) => {
      return conv;
    }).catch(async err => {
      console.warn(`This error can be handled better`)
      console.error(`No existing conversation ${err}, trying to initiate one`)
      const conv = await service.createConversation(other);
      await processPreKeyBundle(other, conv.bundle!);
      return FireflyProtos.Conversation.create({
        id: conv.conversationId,
        other: conv.other,
        startedBy: conv.startedBy,
      });
    })
  }

  const [isInitialized, setIsinitialized] = useState(false)
  async function initialize() {
    await libsignal.default()

    checkSelfBundles()
    setIsinitialized(true)
  }


  function onMessageCallback(message: FireflyProtos.ServerMessage) {
    for (const listener of eventListeners.current) {
      listener(client!, FireflyProtos.ServerMessage.create({ ...message }))
    }
  }

  const addEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.add(cb)
  }
  const removeEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.delete(cb)
  }

  if (!isInitialized) {
    return <div><Loader /></div>
  }

  return <FireflyContext.Provider value={{
    client,
    addEventListener, removeEventListener,
    initialize: client.initialize,
    dispose: client.dispose,
    encrypt, decrypt,
    service,
    processPreKeyBundle,
    getConversation
  }}> <Outlet /> </FireflyContext.Provider>
}



export function useFirefly() {
  const context = useContext(FireflyContext)
  if (context === undefined) {
    throw new Error("useFirefly must be used within an FireflyProvider")
  }
  return context
}

