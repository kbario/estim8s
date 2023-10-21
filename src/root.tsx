// @refresh reload
import { Match, Show, Suspense, Switch } from "solid-js";
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
import { Toast } from "./components/toast";

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
  { display: 'estim8', url: 'https://estim8.kbar.io/', target: "_blank" },
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
                <A class="btn" href="/">esitm8s</A>
                <ul class="flex gap-2 items-center">
                  {
                    navItems.map(it =>
                      <li>
                        <A href={it.url} class={`btn group`} target={it?.target}>{
                          <div class={`border-b-2 ${active(it.url)}`}>{it.display}</div>
                        }</A>
                      </li>
                    )
                  }
                  <li>
                    <A href='/account' class={`btn group`}>
                      <div class="avatar placeholder">
                        <Switch fallback={
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }>
                          <Match when={state.data?.uid}>
                            <div class="bg-neutral-focus text-neutral-content rounded-full w-8 aspect-square">
                              <span>{state.data?.displayName?.charAt(0)}</span>
                            </div>
                          </Match>
                          <Match when={state.loading}>
                            <span class="loading loading-spinner loading-md"></span>
                          </Match>
                        </Switch>
                      </div>
                    </A>
                  </li>
                </ul>
              </nav>
              <Routes>
                <FileRoutes />
              </Routes>
              <Toast />
            </FirebaseProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
