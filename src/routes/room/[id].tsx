import { useParams } from "solid-start";
import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, collectionGroup, doc, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createSignal, For } from "solid-js";
import { A, useNavigate } from "solid-start";
 
export default function Room() {
  const params = useParams();

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const state = useAuth(getAuth(app))

  const room = useFirestore(doc(db, 'rooms', params.id))


  return (<div>room {room.data?.name}</div>)
}
