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
import { FirebaseProvider, useAuth, useFirebaseApp } from 'solid-firebase'
import { getAuth } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC-wWLRjfbyHlDvJpbHbF5x5gnU8jF38C4",
  authDomain: "estim8s.firebaseapp.com",
  projectId: "estim8s",
  storageBucket: "estim8s.appspot.com",
  messagingSenderId: "851908082723",
  appId: "1:851908082723:web:b552abfc5eab63c1c50596",
  measurementId: "G-Z9FWG08L99"
})

const navItems = [
  { display: 'Home', url: '/' },
  { display: 'Login', url: '/login' },
]

export default function Root() {
  const location = useLocation();

  const state = useAuth(getAuth(app))

  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent group-hover:border-sky-600";
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
              <nav class="navbar justify-between">
                <div>esitm8s</div>
                <ul class="flex gap-2 items-center">
                  {
                    navItems.map(it =>
                      <li>
                        <A href={it.url} class={`btn group`}>{
                          <div class={`border-b-2 ${active(it.url)}`}>{it.display}</div>
                        }</A>
                      </li>
                    )
                  }
                  <li>
                    <A href='/account' class={`btn group`}>
                      {/* <div class={`border-b-2 ${active('account')}`}></div> */}
                      <div class="avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-8 aspect-square">
                          <span>{state.data?.displayName?.charAt(0)}</span>
                        </div>
                      </div>
                    </A>
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
