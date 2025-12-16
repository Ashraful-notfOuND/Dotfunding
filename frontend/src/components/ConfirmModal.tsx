import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({ open, title = "Confirm", message, onConfirm, onCancel }: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>No</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>Yes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmModal;
