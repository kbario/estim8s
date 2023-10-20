import { getAuth, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, createRenderEffect, createSignal, onMount } from 'solid-js';
import { useNavigate } from 'solid-start';
import Input from '~/components/input';
import { EMAIL_FOR_LOGIN } from '~/constants/localStorage';
import { validateEmail } from '~/utils/emailValidation';

export default function Login() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const user = useAuth(getAuth(app))

  const [email, setEmail] = createSignal('')

  createEffect(function routeGuard(){
    if (user.loading) return 
    if (user.data?.uid) navigate('/')
  })

  const signIn = () => {
    if (validateEmail(email())) {
      sendSignInLinkToEmail(getAuth(app), email(), actionCodeSettings)
        .then(() => {
          if (validateEmail(email())) {
            window.localStorage.setItem(EMAIL_FOR_LOGIN, email())
          }
        })
    }
  }

  return (
    <main class="flex flex-col gap-4 items-center justify-center h-[80vh]">
      <h1 class="text-6xl text-white">Login</h1>
      <div class="flex flex-col gap-2">
        <Input sig={email} setSig={setEmail} type='email' placeholder='email' autocomplete='email' / >
        <button class="btn" onClick={signIn}>Login</button>
      </div>
    </main>
  );
}

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: window.location.href.includes('localhost')
    ? 'http://localhost:3000/link-login'
    : 'https://estim8s.kbar.io/link-login',
  // This must be true.
  handleCodeInApp: true,
}
