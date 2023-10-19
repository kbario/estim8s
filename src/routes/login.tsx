import { getAuth, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, createRenderEffect, createSignal, onMount } from 'solid-js';
import { useNavigate } from 'solid-start';
import Input from '~/components/input';
import { validateEmail } from '~/utils/emailValidation';

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

export default function Login() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const state = useAuth(getAuth(app))

  const [email, setEmail] = createSignal('')

  createEffect(() => {
    if (state.data?.uid) navigate('/')
  })

  const signIn = () => {
    if (validateEmail(email())) {
      sendSignInLinkToEmail(getAuth(app), email(), actionCodeSettings)
        .then(() => {
          if (validateEmail(email())) {
            window.localStorage.setItem('emailForSignIn', email())
          }
        })
    }
  }

  return (
    <main class="text-center mx-auto text-gray-700 p-4 flex flex-col items-center">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Sign in
      </h1>

      <div class="flex flex-col gap-2">
        <Input sig={email} setSig={setEmail} prop:type={'email'}></Input>
        {/* <input use:model={[pass, setPass]} type="text" placeholder="password" class="input text-white input-bordered w-full max-w-xs" /> */}
        <button class="btn" onClick={signIn}>Sign in</button>
      </div>
    </main>
  );
}

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  // url: 'https://estim8s.kbar.io/link-login',
  url: window.location.href.includes('localhost')
    ? 'http://localhost:3000/link-login'
    : 'https://estim8s.kbar.io/link-login',
  // This must be true.
  handleCodeInApp: true,
}
