import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, collectionGroup, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createSignal, For } from "solid-js";
import { A, useNavigate } from "solid-start";
import Counter from "~/components/Counter";
import Input from "~/components/input";

export default function Home() {
  const navigate = useNavigate()
  const app = useFirebaseApp()
  const db = getFirestore(app)
  const state = useAuth(getAuth(app))

  const rooms = useFirestore(collection(db, 'rooms'))

  const [newRoom, setNewRoom] = createSignal('')

  const goToRoom = (id: string) => () => navigate(`/room/${id}`)
  const addRoom = () => {
    addDoc(collection(db, 'rooms'), { name: newRoom() })
  }
  const logout = () => {
    signOut(getAuth(app))
  }

  return (
    <main class="flex flex-col">
      <For each={rooms.data} fallback={<div>hello</div>}>{
        (x) => <button onClick={goToRoom(x.id)}>{x?.name}</button>
      }</For>
      <Input sig={newRoom} setSig={setNewRoom}></Input>
      <button onClick={addRoom}> add Room</button>
      <button onClick={logout}>logout</button>
    </main>
  );
}
