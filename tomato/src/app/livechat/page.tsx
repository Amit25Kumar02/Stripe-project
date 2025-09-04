import LiveChatWidget from "./LiveChatWidget";

export default function LiveChatPage() {
  // In a real application, fetch this user data from your API
  // You would use a server component or an API call inside a useEffect hook.
  const userData = {
    id: "player12345",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    country: "USA",
    ip_address: "192.168.1.1",
    device: "Desktop",
    os: "Windows",
    registration_date: "2023-01-15",
    kyc_status: "Verified",
    account_status: "Active",
    balance: 500.50,
    currency: "USD",
    vip_level: "Gold",
    risk_flags: "None",
  };

  return (
    <div>
      <h1>LiveChat Integration</h1>
      <p>This page demonstrates the LiveChat widget with dynamic user data.</p>
      <LiveChatWidget license={12345678} userData={userData} />
    </div>
  );
}