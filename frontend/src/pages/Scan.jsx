import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Link2, QrCode, Wallet, Loader2, Upload } from "lucide-react";
import { api } from "../lib/api.js";
import jsQR from "jsqr";

const TABS = [
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "url", label: "URL", icon: Link2 },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "payment", label: "Payment", icon: Wallet },
];

export default function Scan() {
  const [active, setActive] = useState("message");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // form state
  const [messageText, setMessageText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const fileInputRef = useRef(null);

  const runScan = async (fn) => {
    setLoading(true);
    setError("");
    try {
      const result = await fn();
      navigate(`/results/${result.id}`, { state: { result } });
    } catch (e) {
      setError(e.message || "Something went wrong while scanning.");
    } finally {
      setLoading(false);
    }
  };

  const handleQrFile = (file) => {
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setQrPayload(code.data);
        } else {
          setError("Could not decode a QR code in that image. Try a clearer image, or paste the payload text directly.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <h1 className="font-display font-semibold text-3xl text-navy-900 mb-2">Scan something</h1>
      <p className="text-navy-700/70 mb-8">Choose what you want checked. Every result comes with evidence, not just a label.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActive(t.id); setError(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive ? "bg-navy-900 text-white" : "bg-white text-navy-700 border border-navy-900/10 hover:border-navy-900/20"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 border border-navy-900/5">
        {active === "message" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-navy-800">Paste the SMS or email text</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={6}
              placeholder='e.g. "Congratulations! You won ₹25,000. Click this link to claim now!"'
              className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none resize-none"
            />
            <button
              disabled={!messageText.trim() || loading}
              onClick={() => runScan(() => api.scanMessage(messageText))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-display font-semibold disabled:opacity-40 hover:bg-indigo-500/90 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Analyze message
            </button>
          </div>
        )}

        {active === "url" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-navy-800">Paste the link</label>
            <input
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="e.g. hdfcbank-secure-login.top/auth"
              className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none"
            />
            <button
              disabled={!urlText.trim() || loading}
              onClick={() => runScan(() => api.scanUrl(urlText))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-display font-semibold disabled:opacity-40 hover:bg-indigo-500/90 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Analyze URL
            </button>
          </div>
        )}

        {active === "qr" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-navy-800">Upload a QR code image</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-navy-900/15 rounded-xl py-10 flex flex-col items-center gap-2 text-navy-700/60 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
            >
              <Upload size={24} />
              <span className="text-sm font-medium">Click to upload an image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleQrFile(e.target.files?.[0])}
            />
            <div className="text-center text-xs text-navy-700/50">or paste the decoded payload directly</div>
            <input
              value={qrPayload}
              onChange={(e) => setQrPayload(e.target.value)}
              placeholder="e.g. upi://pay?pa=name@bank&am=500"
              className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none font-mono"
            />
            <button
              disabled={!qrPayload.trim() || loading}
              onClick={() => runScan(() => api.scanQr(qrPayload))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-display font-semibold disabled:opacity-40 hover:bg-indigo-500/90 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Analyze QR payload
            </button>
          </div>
        )}

        {active === "payment" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">UPI ID</label>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@bank"
                className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">Amount (₹, optional)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">Message accompanying the request (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-navy-900/15 p-4 text-sm focus:border-indigo-500 outline-none resize-none"
              />
            </div>
            <button
              disabled={!upiId.trim() || loading}
              onClick={() => runScan(() => api.scanPayment(upiId, amount ? Number(amount) : null, note))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-display font-semibold disabled:opacity-40 hover:bg-indigo-500/90 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Analyze payment
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-risk-600 bg-risk-100 rounded-lg px-4 py-3">{error}</div>
        )}
      </div>
    </div>
  );
}
