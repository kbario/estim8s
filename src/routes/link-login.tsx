import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, onMount } from 'solid-js';
import { useNavigate } from "solid-start";
import { EMAIL_FOR_LOGIN } from "~/constants/localStorage";
import { validateEmail } from '~/utils/emailValidation';

export default function LinkLogin() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const user = useAuth(getAuth(app))

  createEffect(function routeGuard() {
    if (user.loading) return
    if (user.data?.uid) navigate('/')
  })

  onMount(() => {
    const auth = getAuth(app);
    if (!isSignInWithEmailLink(auth, window.location.href)) return navigate('/');
    let email = window.localStorage.getItem(EMAIL_FOR_LOGIN);
    if (!email) {
      email = window.prompt('Please provide your email for confirmation')
    }
    if (email && validateEmail(email)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem(EMAIL_FOR_LOGIN);
        })
        .catch((error) => {
          console.log(error)
        });
    }
  })

  return (
    <main class="flex flex-col h-[80vh] w-full items-center justify-center">
      <span class="loading loading-infinity w-32 aspect-video text-primary"></span>
      <div class="flex items-end gap-1">
        <span>loading</span>
        <span class="loading loading-dots loading-xs"></span>
      </div>
    </main>
  );
}

