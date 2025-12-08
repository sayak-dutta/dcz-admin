import "@/styles/globals.css";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export default function App({ Component, pageProps }) {
  return (
    <AdminAuthProvider>
      <Component {...pageProps} />
    </AdminAuthProvider>
  );
}
