"use client";

import { useState, useEffect } from "react";
import { Mail, MonitorPlay, Save, Send } from "lucide-react";

export default function EmailBuilder() {
  const [mode, setMode] = useState<"basic" | "html">("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Mode States
  const [subject, setSubject] = useState("Your Event Entry Pass is Here!");
  const [heading, setHeading] = useState("Hello {{Name}}!");
  const [message, setMessage] = useState("Thank you for registering for the upcoming IGAC event. Your role is: <strong>{{Role}}</strong>.\n\nAttached to this email, you will find your Event Entry Pass.");
  const [signoff, setSignoff] = useState("Best regards,<br/>The Secretariat Team");

  // Raw HTML Mode State
  const [htmlContent, setHtmlContent] = useState<string>(
    `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; }
  h1 { color: #333333; }
  .footer { margin-top: 20px; font-size: 12px; color: #888888; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <h1>Hello {{Name}}!</h1>
    <p>Thank you for registering for the upcoming IGAC event. Your role is: <strong>{{Role}}</strong>.</p>
    <p>Attached to this email, you will find your Event Entry Pass.</p>
    <br/>
    <p>Best regards,<br/>The Secretariat Team</p>
    <div class="footer">
      Please do not reply to this automated email.
    </div>
  </div>
</body>
</html>`
  );

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch("/api/admin/templates");
        if (res.ok) {
          const json = await res.json();
          const emailConfig = json.data?.email_config;
          if (emailConfig) {
            if (emailConfig.mode) setMode(emailConfig.mode);
            if (emailConfig.subject) setSubject(emailConfig.subject);
            if (emailConfig.heading) setHeading(emailConfig.heading);
            if (emailConfig.message) setMessage(emailConfig.message);
            if (emailConfig.signoff) setSignoff(emailConfig.signoff);
            if (emailConfig.htmlContent) setHtmlContent(emailConfig.htmlContent);
          }
        }
      } catch (err) {
        console.error("Failed to load email config", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailTemplate: {
            mode,
            subject,
            heading,
            message,
            signoff,
            htmlContent,
          }
        }),
      });
      if (res.ok) {
        alert("Email template saved successfully!");
      } else {
        alert("Failed to save template.");
      }
    } catch (err) {
      alert("Error saving email template.");
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveHtml = () => {
    if (mode === "html") return htmlContent;

    return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; }
  h1 { color: #333333; }
  .message { line-height: 1.6; color: #555555; }
  .footer { margin-top: 20px; font-size: 12px; color: #888888; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <h1>${heading}</h1>
    <div class="message">
      <p>${message.replace(/\n/g, "<br/>")}</p>
      <br/>
      <p>${signoff}</p>
    </div>
    <div class="footer">
      Please do not reply to this automated email.
    </div>
  </div>
</body>
</html>`;
  };

  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert("Please enter a test email address.");
      return;
    }

    setIsSending(true);
    try {
      const finalHtml = getActiveHtml()
        .replace(/{{Name}}/g, "John Doe")
        .replace(/{{Role}}/g, "Delegate")
        .replace(/{{Email}}/g, testEmail);

      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmail,
          subject: subject, // Uses the state subject for basic OR you can just set in HTML mode
          htmlContent: finalHtml,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        if (json.simulated) {
          alert(`Test email successfully sent (Simulated - No API Key) to ${testEmail}`);
        } else {
          alert(`Test email sent to ${testEmail}!`);
        }
      } else {
        alert("Failed to send test email: " + (json.error?.message || json.error));
      }
    } catch (err) {
      alert("Error sending email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex bg-gray-50 border-b border-gray-200 items-center justify-between px-4 py-3 shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5 text-gray-700" />
          Email Template Builder
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Test email address..."
              className="text-sm border border-gray-300 px-3 py-1.5 rounded-l-md outline-none focus:ring-1 focus:ring-blue-500 w-64"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <button 
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              onClick={handleSendTestEmail}
              disabled={isSending}
            >
              {isSending ? "Sending..." : <><Send className="w-3.5 h-3.5" /> Test</>}
            </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
            <span className="font-semibold text-gray-500 animate-pulse">Loading Template...</span>
          </div>
        )}
        {/* Editor Area */}
        <div className="w-full h-full border-r border-gray-200 flex flex-col min-h-0 bg-white">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-sm flex gap-6 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input 
                type="radio" 
                name="editorMode" 
                checked={mode === "basic"} 
                onChange={() => setMode("basic")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              /> 
              Basic Builder
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input 
                type="radio" 
                name="editorMode" 
                checked={mode === "html"} 
                onChange={() => setMode("html")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              /> 
              Custom HTML
            </label>
          </div>

          {mode === "html" ? (
            <>
              <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                <label className="font-semibold block mb-1">Email Subject:</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  className="w-full px-2 py-1.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <textarea
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#1e1e1e] text-[#d4d4d4]"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                spellCheck={false}
              />
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 shrink-0">
                Available variables: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-700">{'{{Name}}'}</code> <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-700">{'{{Role}}'}</code> <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-700">{'{{Email}}'}</code>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input 
                   type="text" 
                   value={subject} 
                   onChange={(e) => setSubject(e.target.value)} 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                <input 
                   type="text" 
                   value={heading} 
                   onChange={(e) => setHeading(e.target.value)} 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                  Message Body
                  <span className="text-xs font-normal text-gray-400">HTML is allowed</span>
                </label>
                <textarea 
                   value={message} 
                   onChange={(e) => setMessage(e.target.value)} 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sign-off</label>
                <textarea 
                   value={signoff} 
                   onChange={(e) => setSignoff(e.target.value)} 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm h-16 resize-none"
                />
              </div>
              <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-200">
                <strong>Tip:</strong> Use variables like <code className="bg-blue-100 px-1 py-0.5 rounded">{'{{Name}}'}</code> or <code className="bg-blue-100 px-1 py-0.5 rounded">{'{{Role}}'}</code> inside the inputs.
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="w-full h-full bg-gray-50 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-600 flex items-center gap-2 shrink-0">
            <MonitorPlay className="w-4 h-4" /> Live Preview
          </div>
          <div className="flex-1 p-4 overflow-auto flex justify-center">
            <div className="w-full max-w-2xl bg-white shadow-md border border-gray-300 rounded overflow-hidden flex flex-col" style={{ minHeight: "500px" }}>
              <div className="bg-gray-100 px-3 py-3 border-b border-gray-200 text-sm text-gray-700 truncate">
                <span className="font-bold text-gray-500 mr-2">Subject:</span> {subject.replace(/{{Name}}/g, "John Doe")}
              </div>
              <iframe
                title="Email Preview"
                srcDoc={getActiveHtml().replace(/{{Name}}/g, "John Doe").replace(/{{Role}}/g, "Delegate")}
                className="w-full flex-1 border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
