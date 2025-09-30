import React from "react";
import QRCode from "react-qr-code";

const PattaQRCodeModal = ({ open, onClose, patta }) => {
  if (!open || !patta) return null;
  // Prepare a details string or URL for QR code
  const details = JSON.stringify(patta, null, 2);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Share Patta Details (QR Code)</h3>
        <QRCode value={details} size={220} />
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto w-full">{details}</pre>
        <button className="mt-6 px-4 py-2 bg-green-600 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PattaQRCodeModal;
