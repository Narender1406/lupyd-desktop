
"use client"


import { createContext, useContext, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

type DialogContextType = {
  showDialog: (content: ReactNode) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);
export const useGlobalDialog = () => useContext(DialogContext)!;

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const showDialog = (node: ReactNode) => {
    setContent(node);
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 bg-white p-6 rounded shadow-lg -translate-x-1/2 -translate-y-1/2 z-50 min-w-[300px]">
            {content}
            <Dialog.Close asChild>
              <button className="absolute top-2 right-2 text-xl">×</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </DialogContext.Provider>
  );
};
