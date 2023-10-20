import { getAuth, signOut } from "firebase/auth";
import { addDoc, getDoc, doc, updateDoc, collection, collectionGroup, DocumentData, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { A, useNavigate } from "solid-start";
import Counter from "~/components/Counter";
import { SigInput } from "~/components/input";

function aDefault(value: number, enabled = true) {
  return {
    enabled: enabled,
    value,
  }
}
function defaults() {
  return [
    aDefault(1),
    aDefault(1),
    aDefault(2),
    aDefault(4),
    aDefault(1),
    aDefault(0.5),
    aDefault(1),
    aDefault(1.1),
  ]
}

export default function Home() {
  const navigate = useNavigate()

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))

  createEffect(function routeGuard() {
    if (user.loading) return
    if (!user.data?.uid) navigate('/login')
  })

  const rooms = useFirestore(collection(db, 'rooms'))

  const [newRoom, setNewRoom] = createSignal('')


  const addRoom = async () => {
    if (user.data?.uid && newRoom()) {
      const doco = await addDoc(collection(db, 'rooms'), {
        name: newRoom(),
        leadId: user.data.uid,
        leadName: user.data.displayName,
        users: {
          [user.data.uid]: [
            ...defaults()
          ],
        }
      })
      // const id = await (await getDoc(doco)).data()?.id
      const id = (await getDoc(doco)).id
      setNewRoom('')
      navigate(`room/${id}`)
    }
  }

  return (
    <main class="flex flex-col">
      <Switch>
        <Match when={rooms.data}>
          <div class="flex flex-col items-start">
            <For each={rooms.data}>{
              (x) => <RoomDisplay room={x} user={user} />
            }</For>
          </div>

          {user.data?.uid && <div class="flex gap-2">
            <SigInput sig={newRoom} setSig={setNewRoom} />
            <button class="btn" onClick={addRoom}> add Room</button>
          </div>}
        </Match>
        <Match when={rooms.loading}>
          <span class="loading loading-ring loading-lg"></span>
        </Match>
        <Match when={rooms.error}>
          <div>error: {rooms.error?.name}</div>
        </Match>
      </Switch>
    </main>
  );
}

type RoomDisplayProps = {
  room: DocumentData,
  user: ReturnType<typeof useAuth>
}

function RoomDisplay(props: RoomDisplayProps) {
  const navigate = useNavigate()

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))

  const addUserToRoom = async (id: string) => {
    if (user.data?.uid) {
      const doco = await getDoc(doc(db, 'rooms', id));
      const docoData = doco.data()
      const roomHasUser = !!doco.data()?.users[user.data.uid]
      console.log(docoData, roomHasUser)
      if (!roomHasUser) {
        await updateDoc(doc(db, 'rooms', id), {
          users: {
            [user.data.uid]: [
              ...defaults()
            ],
            ...docoData?.users,
          },
        })
      }
    }
  }

  const goToRoom = (id: string) => async () => {
    if (!props.user.data?.uid) return
    await addUserToRoom(id)
    navigate(`/room/${id}`)
  }

  return <div class="flex gap-4">
    <button
      class={'btn'}
      classList={{
        glass: !!props.user.data?.uid,
        'hover:cursor-default hover:border-base-200 hover:bg-base-200': !props.user.data?.uid
      }}
      onClick={goToRoom(props.room?.id)}>
      {props.room?.name}
    </button>
    <div class="avatar-group -space-x-6 !overflow-visible">
      {Object.keys(props.room.users).map(x =>
        <div class="tooltip" data-tip={x}>
          <div class="avatar bg-base-300">
            <div class="w-12 ">
              <span>{x.charAt(0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
}
