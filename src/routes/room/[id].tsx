import { useParams } from "solid-start";
import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createEffect, createMemo, createSignal, For } from "solid-js";
import { A, useNavigate } from "solid-start";
import { Input } from "~/components/input";

const labels = [
  'Communication & Meetings',
  'Initial Setup',
  "Development",
  'Revision/Bug-fixes',
  "writing Tests",
  'Manual Testing',
  "Merging & Deployment",
  "Learning Time/Non-project",
  "Confidence Level"
]

export default function Room() {
  const params = useParams();
  const navigate = useNavigate()

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))

  const room = useFirestore(doc(db, 'rooms', params.id))

  createEffect(function leaveIfRoomDelete(){
    if(!room.data?.leadId && !room.loading){
      navigate('/')
    }
  })

  const userScores = createMemo(() => user.data?.uid ? room.data?.users[user.data.uid] : [])
  const otherUserScores = createMemo(() => {
    if (!!user.data?.uid && room.data?.users) {
      const { [user.data.uid]: omitted, ...others } = room.data.users
      return Object.entries(others) //as [string, [{enabled: boolean, value:true}]]
    }
    return room.data?.users ? Object.entries(room.data?.users) : []
  })

  const leaveRoom = async () => {
    const docoData = (await getDoc(doc(db, 'rooms', params.id))).data();
    if (!!user.data?.uid && docoData?.users) {
      const roomHasUser = !!docoData?.users[user.data.uid]
      if (roomHasUser) {
        const { [user.data.uid]: omitted, ...others } = docoData.users
        await updateDoc(doc(db, 'rooms', params.id), {
          users: others
        })
      }
    }
    navigate('/')
  }

  const deleteRoom = async () => {
    const ruSure = confirm('are you sure?')
    if (ruSure) {
      await deleteDoc(doc(db, 'rooms', params.id))
      navigate('/')
    }
  }

  return <div>
    <h3 class="text-xl ">{room.data?.name}</h3>
    {room.data?.leadName}
    <div class="flex gap-4">
      <div class="flex flex-col">
        <For each={userScores()}>
          {(score, idx) => <div class="flex gap-1">
            <div class="form-control">
              <label class="label cursor-pointer flex gap-2">
                <input type="checkbox" checked={score.enabled} class="checkbox" />
                <span class="label-text">{labels[idx()]}</span>
              </label>
            </div>
            <Input sig={score.value} setSig={(v: typeof score) => (score = v)} />
          </div>}
        </For>
      </div>
      <For each={otherUserScores()}>
        {([user, scores]) => <div>
          <For each={scores as { enabled: boolean, value: number }[]} fallback={<div>ahhh2</div>}>{(score) =>
            <div class="text-red-200">{score.value}</div>
          }</For>
        </div>
        }
      </For>
    </div>
    <div class="flex gap-1 absolute right-4 bottom-4">
      <button onClick={leaveRoom} class="btn">leave room</button>
      {(room.data?.leadId === user.data?.uid) && <button onClick={deleteRoom} class="btn">delete room</button>}
    </div>
  </div>
}
