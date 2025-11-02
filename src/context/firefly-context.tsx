"use client"

import * as fireflyClientJs from "firefly-client-js"
import { createContext, useContext, useRef, useEffect, useState, useMemo } from "react"

import { useAuth } from "./auth-context"
import { Outlet } from "react-router-dom";

import { bMessageToDMessage, EncryptionPlugin, isBMessage, type DMessage } from "./encryption-plugin";
import { toBase64 } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";


type MessageCallbackType = (client: fireflyClientJs.FireflyWsClient, message: DMessage) => void;

type FireflyContextType = {
  client: fireflyClientJs.FireflyWsClient,
  service: fireflyClientJs.FireflyService,
  addEventListener: (cb: MessageCallbackType) => void,
  removeEventListener: (cb: MessageCallbackType) => void,

  initialize: () => Promise<void>,
  dispose: () => void,

  encryptAndSend: (convoId: bigint, other: string, text: Uint8Array) => Promise<DMessage>
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




  useEffect(() => {

    const listener = Capacitor.addListener!("EncryptionPlugin", "onUserMessage", (data, err) => {
      if (err) {
        throw err
      }


      if (isBMessage(data)) {
        const dmsg = bMessageToDMessage(data)
        eventListeners.current.forEach(e => e(client, dmsg))
      }

    })

    return () => { listener.remove() }

  }, [])


  if (!auth.username) {
    return <div>User should complete authentication to see this page</div>
  }


  // async function initialize() {
  // await checkSelfConversations()
  // await checkSelfBundles()
  // }



  // const sessionStore = newJsSessionStoreExposed()
  // const preKeyStore = newJsPreKeyStoreExposed()
  // const signedPreKeyStore = newJsSignedPreKeyStoreExposed()
  // const kyberPreKeyStore = newJsKyberPreKeyStoreExposed()
  // const identityStore = newJsIdentityStoreExposed()

  // useEffect(() => () => {
  //   sessionStore.sessionStore.free()c
  //   preKeyStore.preKeyStore.free()
  //   signedPreKeyStore.signedPreKeyStore.free()
  //   kyberPreKeyStore.kyberPreKeyStore.free()
  //   identityStore.identityStore.free()
  // }, [])

  const buildClient = () => {
    const c = new fireflyClientJs.FireflyWsClient(websocketUrl, async () => {
      if (!auth.username) throw Error(`Not authenticated`);
      const token = await auth.getToken(); if (!token) {
        throw Error(`Not authenticated`)
      } else {
        return token
      }
    }, Number.MAX_SAFE_INTEGER, 1000, 2000);

    c.addEventListener("onMessage", (e) => {
      const event = e as CustomEvent<fireflyClientJs.protos.ServerMessage>
      onMessageCallback(event.detail)
    })

    c.addEventListener("onConnect", _ => {
      EncryptionPlugin.syncUserMessages()
    })

    return c;
  }
  const [client, _] = useState<fireflyClientJs.FireflyWsClient>(buildClient())
  const service = useMemo(() => new fireflyClientJs.FireflyService(apiUrl, async () => {
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
      // initialize()
      client!.initialize().then(() => console.log(`Firefly initialized`)).catch(console.error);

    }

  }, [auth])

  // async function encrypt(payload: Uint8Array, other: string) {
  //   const addr = new libsignal.ProtocolAddress(other, 1)
  //   try {
  //     const message = await libsignal.signalEncrypt(payload, addr, sessionStore.sessionStore, identityStore.identityStore, BigInt(Date.now()));

  //     const cipherText = message.serialize()
  //     const cipherType = message.type()
  //     message.free()
  //     addr.free()
  //     return { cipherText, cipherType }
  //   } catch (err) {
  //     addr.free()
  //     throw err
  //   }

  // }

  // async function decrypt(cipherText: Uint8Array, cipherType: number, from: string) {

  //   const addr = new libsignal.ProtocolAddress(from, 1)

  //   const toFree: { free: () => void; }[] = [addr]
  //   let deciphered = new Uint8Array()

  //   try {
  //     switch (cipherType) {

  //       case libsignal.CiphertextMessageType.PreKey: {
  //         const message = libsignal.PreKeySignalMessage.deserialize(cipherText);
  //         toFree.push(message);
  //         const result = await libsignal.signalDecryptPreKey(message, addr, sessionStore.sessionStore, identityStore.identityStore,
  //           preKeyStore.preKeyStore, signedPreKeyStore.signedPreKeyStore, kyberPreKeyStore.kyberPreKeyStore, libsignal.UsePQRatchet.Yes)
  //         deciphered = new Uint8Array(result);
  //         break

  //       }
  //       case libsignal.CiphertextMessageType.Whisper: {
  //         const message = libsignal.SignalMessage.deserialize(cipherText)
  //         toFree.push(message)
  //         const result = await libsignal.signalDecrypt(
  //           message,
  //           addr,
  //           sessionStore.sessionStore,
  //           identityStore.identityStore,
  //         );
  //         deciphered = new Uint8Array(result);
  //         break
  //       }
  //       default: {

  //       }
  //     }
  //   } catch (err) {
  //     // toFree.forEach(e => e.free())
  //     throw err
  //   }

  //   // toFree.forEach(e => e.free())
  //   return deciphered

  // }

  // async function processPreKeyBundle(other: string, bundle: FireflyProtos.PreKeyBundle) {
  //   const toFree: { free: () => void; }[] = []
  //   try {
  //     const addr = new libsignal.ProtocolAddress(other, 1)
  //     toFree.push(addr)
  //     const prePublicKey = libsignal.PublicKey.deserialize(bundle!.prePublicKey)
  //     toFree.push(prePublicKey)
  //     const signedPrePublicKey = libsignal.PublicKey.deserialize(bundle!.signedPrePublicKey)
  //     toFree.push(signedPrePublicKey)
  //     const identityPublicKey = libsignal.PublicKey.deserialize(bundle!.identityPublicKey)
  //     toFree.push(identityPublicKey)
  //     const KEMPrePublicKey = libsignal.KEMPublicKey.deserialize(bundle!.KEMPrePublicKey)
  //     toFree.push(KEMPrePublicKey)
  //     const preKeyBundle = new libsignal.PreKeyBundle(
  //       bundle!.registrationId,
  //       bundle!.deviceId,
  //       bundle!.preKeyId,
  //       prePublicKey,
  //       bundle!.signedPreKeyId,
  //       signedPrePublicKey,
  //       bundle!.signedPreKeySignature,
  //       identityPublicKey,
  //       bundle!.KEMPreKeyId,
  //       KEMPrePublicKey,
  //       bundle!.KEMPreKeySignature,
  //     );

  //     toFree.push(preKeyBundle)

  //     console.log(`Processing preKeyBundle `, bundle)

  //     await libsignal.processPreKeyBundle(preKeyBundle, addr, sessionStore.sessionStore, identityStore.identityStore, libsignal.UsePQRatchet.Yes, BigInt(Date.now()))

  //   } catch (err) {
  //     // toFree.forEach(e => e.free())
  //     throw err
  //   }

  //   // toFree.forEach(e => e.free())

  // }


  // async function checkSelfBundles() {
  //   const bundles = await service.getPreKeyBundles();
  //   const bundleIdsToDelete: number[] = []
  //   for (const bundle of bundles.bundles) {

  //     const result = await preKeyStore.store.get(bundle.preKeyId.toString());

  //     if (!(result && result instanceof Uint8Array)) {
  //       bundleIdsToDelete.push(bundle.preKeyId)
  //     }
  //   }

  //   if (bundleIdsToDelete.length > 0) {
  //     await service.deletePreKeyBundles(bundleIdsToDelete)
  //   }

  //   if (bundles.bundles.length - bundleIdsToDelete.length < 16) {
  //     const toFree: { free: () => void; }[] = []
  //     const randInt = () =>
  //       new DataView(crypto.getRandomValues(new Uint8Array(8)).buffer).getUint16(0, true)

  //     const registrationId = 1;
  //     const deviceId = 1;

  //     try {
  //       const identityKey =
  //         libsignal.IdentityKeyPairWrapper.deserialize(await identityStore.get_identity_key_handler());
  //       toFree.push(identityKey)
  //       const identityPublicKey = identityKey.getPublicKey();
  //       toFree.push(identityPublicKey)

  //       const newBundles = FireflyProtos.PreKeyBundles.create()

  //       for (let i = 0; i < 16 - (bundles.bundles.length - bundleIdsToDelete.length); i++) {
  //         const preKeyId = randInt()
  //         const signedPreKeyId = randInt()
  //         const KEMPreKeyId = randInt()

  //         const KEMPreKey = libsignal.KEMKeyPair.generate();
  //         toFree.push(KEMPreKey)

  //         const KEMPublicKey = KEMPreKey.getPublicKey();
  //         toFree.push(KEMPublicKey)

  //         const KEMPreKeySignature = identityKey.sign(KEMPublicKey.serialize());

  //         const preKey = libsignal.PrivateKey.generate();
  //         toFree.push(preKey)
  //         const sPreKey = libsignal.PrivateKey.generate();
  //         toFree.push(sPreKey)

  //         const sPrePublicKey = sPreKey.getPublicKey();
  //         toFree.push(sPrePublicKey)

  //         const signedPreKeySignature = identityKey.sign(
  //           sPrePublicKey.serialize(),
  //         );

  //         const prePublicKey = preKey.getPublicKey();
  //         toFree.push(prePublicKey)

  //         const bundle = FireflyProtos.PreKeyBundle.create({
  //           preKeyId, KEMPreKeyId,
  //           signedPreKeyId,
  //           KEMPreKeySignature,
  //           signedPreKeySignature,
  //           signedPrePublicKey: sPrePublicKey.serialize(),
  //           prePublicKey: prePublicKey.serialize(),
  //           KEMPrePublicKey: KEMPublicKey.serialize(),
  //           identityPublicKey: identityPublicKey.serialize(),
  //           deviceId,
  //           registrationId,
  //         })

  //         {
  //           const record = new libsignal.PreKeyRecord(
  //             preKeyId,
  //             preKey.getPublicKey(),
  //             preKey,
  //           );
  //           toFree.push(record)
  //           await preKeyStore.store_pre_key_handler(preKeyId.toString(), record.serialize());
  //         }

  //         {
  //           const record = new libsignal.SignedPreKeyRecord(
  //             signedPreKeyId,
  //             BigInt(Date.now()),
  //             sPreKey.getPublicKey(),
  //             sPreKey,
  //             signedPreKeySignature,
  //           );
  //           toFree.push(record)
  //           await signedPreKeyStore.store_signed_pre_key_handler(signedPreKeyId.toString(), record.serialize());

  //         }
  //         {
  //           const record = new libsignal.KyberPreKeyRecord(
  //             KEMPreKeyId,
  //             BigInt(Date.now()),
  //             KEMPreKey,
  //             KEMPreKeySignature,
  //           );
  //           toFree.push(record)
  //           await kyberPreKeyStore.store_kyber_pre_key_handler(KEMPreKeyId.toString(), record.serialize(),

  //           );
  //         }

  //         newBundles.bundles.push(bundle)
  //       }

  //       await service.uploadPreKeyBundles(newBundles);
  //     } catch (err) {
  //       throw err
  //     }
  //   }
  // }


  // async function checkSelfConversations() {
  //   const preKeys = await preKeyStore.store.getAll()
  //   if (preKeys.length == 0) {
  //     await service.recreateConversations()
  //   }
  // }

  // async function syncUserMessages() {
  //   const limit = 100
  //   while (true) {
  //     const lastSync = store.get(lastUserMessageTimestampStoreKey) as bigint | undefined ?? 0n
  //     const messages = await service.syncUserMessages(lastSync, limit)
  //     for (const message of messages.messages) {
  //       await handleUserMessage(message)
  //     }

  //     if (messages.messages.length < limit) {
  //       break
  //     }
  //   }
  // }

  async function encryptAndSend(convoId: bigint, other: string, text: Uint8Array) {

    const token = await service.getAuthToken()
    const msg = await EncryptionPlugin.encryptAndSend({
      convoId: Number(convoId), textB64: toBase64(text), to: other, token,
    })

    return bMessageToDMessage(msg)
  }

  async function onMessageCallback(message: fireflyClientJs.protos.ServerMessage) {
    if (message.userMessage) {
      await handleUserMessage(message.userMessage)
    }
  }

  async function handleUserMessage(message: fireflyClientJs.protos.UserMessage) {
    const msg = await EncryptionPlugin.onUserMessage({
      convoId: Number(message.conversationId),
      from: message.from,
      to: message.to,
      textB64: toBase64(message.text),
      type: message.type,
      id: Number(message.id),
    })

    const dmsg = bMessageToDMessage(msg)

    eventListeners.current.forEach(e => e(client, dmsg))


    return dmsg
  }


  const addEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.add(cb)
  }
  const removeEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.delete(cb)
  }


  return <FireflyContext.Provider value={{
    client,
    addEventListener, removeEventListener,
    initialize: client.initialize,
    dispose: client.dispose,
    // encrypt,

    // decrypt,
    service,
    // processPreKeyBundle,
    encryptAndSend,
  }}> <Outlet /> </FireflyContext.Provider>
}



export function useFirefly() {
  const context = useContext(FireflyContext)
  if (context === undefined) {
    throw new Error("useFirefly must be used within an FireflyProvider")
  }
  return context
}

