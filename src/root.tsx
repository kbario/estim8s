// @refresh reload
import { Suspense } from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";

import { initializeApp } from 'firebase/app'
import { FirebaseProvider } from 'solid-firebase'

const app = initializeApp({
  apiKey: "AIzaSyC-wWLRjfbyHlDvJpbHbF5x5gnU8jF38C4",
  authDomain: "estim8s.firebaseapp.com",
  projectId: "estim8s",
  storageBucket: "estim8s.appspot.com",
  messagingSenderId: "851908082723",
  appId: "1:851908082723:web:b552abfc5eab63c1c50596",
  measurementId: "G-Z9FWG08L99"
})

export default function Root() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <Html lang="en">
      <Head>
        <Title>Estim8s</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <FirebaseProvider app={app}>
              <nav class="bg-base-200 flex justify-between items-center">
                <div>Esitm8s</div>
                <ul class="flex gap-2 items-center">
                  <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
                    <A href="/">Home</A>
                  </li>
                  <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
                    <A href="/about">About</A>
                  </li>
                </ul>
              </nav>
              <Routes>
                <FileRoutes />
              </Routes>
            </FirebaseProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
