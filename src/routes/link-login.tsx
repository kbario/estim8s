import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, onMount } from 'solid-js';
import { useNavigate } from "solid-start";
import { validateEmail } from '~/utils/emailValidation';

export default function LinkLogin() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const state = useAuth(getAuth(app))

  onMount(() => {
    const auth = getAuth(app);
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation')
    }
    if (email && validateEmail(email)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
        })
        .catch((error) => {
          console.log(error)
        });
    }
  })

  createEffect(() => {
    if (state.data?.uid) navigate('/')
  })

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Sign in
      </h1>

    </main>
  );
}

