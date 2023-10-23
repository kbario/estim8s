import { debounce } from "@solid-primitives/scheduled";
import { getAuth } from "firebase/auth";
import { doc, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { Accessor, createEffect, createMemo, For, Show } from "solid-js";
import { useNavigate, useParams } from "solid-start";
import { Input } from "~/components/input";
import { a, _deleteRoom, _labels, _leaveRoom, _makeUserName, _updateUserScores } from "~/utils/rooms";

export default function Room() {
  //#region solid
  const params = useParams();
  const navigate = useNavigate()
  //#endregion solid

  //#region firebase
  const app = useFirebaseApp()
  const db = getFirestore(app)
  const auth = getAuth(app)
  const user = useAuth(auth)
  const room = useFirestore(doc(db, 'rooms', params.id))

  const leaveRoom = async () => {
    user.data && await _leaveRoom(user.data, db, params.id)
    navigate('/')
  }
  const deleteRoom = async () => {
    _deleteRoom(db, params.id)
    navigate('/')
  }
  //#endregion firebase

  //#region derived state
  createEffect(function leaveIfRoomIsDeleted() {
    if (!room.data?.leadId && !room.loading) {
      navigate('/')
    }
  })

  createEffect(() => console.log(userScores()))

  // const youBecameLead = createMemo((prev) => !prev && (user.data?.uid === room.data?.leadId) && !user.loading && !room.loading, false)
  // createEffect(function notifyWhenYouBecomeLead() {
  //   if(youBecameLead()) pushToast({ type: 'warning', message: "You're now the room lead"})
  // })
  //
  const listSort = ([al]: [string, any], [bl]: [string, any]) => _labels?.indexOf(al) < _labels?.indexOf(bl) ? -1 : 1

  const thisToThat = (scores: { [k: string]: a }) => {
    return Object.entries(scores).map(([l, v]) => {
      return { enabled: v.enabled, hours: v.value.toString(), min: v.min, name: l }
    })
  }

  // const arst = (acc: number, idv: Thing | EnclosedThing) => {
  //   if (isEnclosedThing(idv)) {
  //     acc += idv.data.reduce(arst, 0);
  //   } else {
  //     acc += idv.enabled ? parseFloat(idv.hours) || 0 : 0;
  //   }
  //   return acc;
  // };

  const SEARCH_PARAM_NAME = "D";
  const zxcd = (init: string) => (acc: string, idv: a, idx: number) => {
    acc += idv.enabled
      ? `${init}- ${_labels[idx]}: ${idv.value}${getPlurality(idv.value.toString())} \n`
      : "";
    return acc;
  };

  const getPlurality = (a?: string) => (a === "1" ? "hr" : "hrs");
  const copy = () => {
    const qwer =
      myFactor()?.enabled && myFactor()?.value
        ? `\ntotal: ${mySum()} * ${myFactor()?.value} = **${mySumByFactor()
          }${getPlurality(mySumByFactor()?.toString())}**`.toString()
        : `\ntotal: **${mySum()}${getPlurality(
          mySum()?.toString()
        )}**`.toString();
    const jkl = `\n\n[Re-estim8 here](https://estim8.kbar.io/?${SEARCH_PARAM_NAME}=${encodeURIComponent(
      JSON.stringify(thisToThat(userScores())),
    )})`;
    const zxcv = Object.values(userScores()).reduce(zxcd(""), "") + qwer + jkl;
    navigator.clipboard.writeText(zxcv);
  }

  const factor = (thing: { [k: string]: a }) => {
    if (!thing) return undefined;
    return thing?.['Confidence Level']
  }

  const sum = (thing: { [k: string]: a }) => {
    if (!thing) return undefined;
    const { ['Confidence Level']: arst, ...rest } = thing
    return Object.values(rest).reduce((acc, idv) => {
      acc += (idv.enabled ? parseFloat(idv.value.toString()) : 0)
      return acc
    }, 0)
  }

  // const sumByFactor = () => factor()?.enabled ? factor()?.value * sum() : sum()
  const userScores = (): { [k: string]: a } => user.data?.uid ? room.data?.users[_makeUserName(user.data)] : {}
  // const userScores = createMemo((): [string, a][] =>
  //   !user.loading && !room.loading && user.data?.uid && room.data?.leadId && room.data?.users[_makeUserName(user.data)]
  //     ? Object.entries()
  //       ?.sort(listSort) as [string, a][]
  //     : []) as Accessor<[string, a][]>
  const mySum = createMemo(() => sum(userScores()))
  const myFactor = createMemo(() => factor(userScores()))
  const mySumByFactor = createMemo(() => myFactor()?.enabled ? Math.ceil(parseFloat((mySum() || 0)) * parseFloat((myFactor()?.value || 1))) : mySum())
  const otherUserScores = createMemo(() => {
    if (!!user.data?.uid && room.data?.users) {
      const { [_makeUserName(user.data)]: omitted, ...others } = room.data.users
      return others ? Object.entries(others) : []
    }
    return room.data?.users ? Object.entries(room.data?.users) : []
  }) as Accessor<[string, { [k: string]: a }][]>
  //#endregion derived state

  return <div class="flex flex-col gap-4 min-w-fit">
    <Show when={room.data && !room.loading}
      fallback={
        <span class="loading loading-ring loading-lg"></span>
      }
    >
      <h3 class="text-2xl font-bold">{room.data?.name}</h3>
      <div class="flex gap-8">
        <div class="flex flex-col">
          {user.data?.displayName}
          {userScores() && <For each={_labels}>
            {l => {
              if (!userScores()[l]) return
              const mut = JSON.parse(JSON.stringify(userScores()[l]))
              const trigger = debounce(async () => {
                user.data &&
                  await _updateUserScores(user.data, db, params.id, l, mut)
              }, 500)
              return <div class="flex gap-4 h-16 items-center justify-between">
                <div class="form-control">
                  <label class="label cursor-pointer flex gap-2">
                    <input
                      class="checkbox"
                      type="checkbox"
                      checked={mut.enabled}
                      onChange={(e) => { mut.enabled = e.target.checked; trigger() }} />
                    <span class="label-text">{l}</span>
                  </label>
                </div>
                <input
                  class="input text-white input-bordered w-24 input-primary"
                  placeholder="estim8"
                  type="number"
                  disabled={!userScores()[l].enabled}
                  pattern="\d*"
                  value={mut.value}
                  onInput={(e) => { mut.value = parseFloat(e.currentTarget.value); trigger() }}
                />
              </div>
            }}
          </For>}
        </div>
        <For each={otherUserScores()}>
          {([user, scores], idx) => {
            const entries = Object.entries(scores)?.sort(listSort)
            return <OtherUserScores entries={entries} idx={idx()} name={user.split("_")[0]} />
          }}
        </For>
      </div>
      {!room.loading && room.data && <div class="flex gap-4 items-end">
        <div class="flex flex-col">
          total
          <div class="text-2xl">
            <Show when={myFactor()?.enabled && !isNaN(myFactor()?.value)}
              fallback={<div class="font-bold">{mySum()}{getPlurality(mySum()?.toString())}</div>}
            >
              <span>{mySum()}</span> * {myFactor()?.value} = <span class="font-bold">
                {mySumByFactor()}{getPlurality(mySumByFactor()?.toString())}
              </span>
            </Show>
          </div>
        </div>
        <button class="btn" onClick={copy}>Copy</button>
      </div>
      }
    </Show>
    <div class="flex flex-col gap-1 items-end absolute right-4 bottom-4">
      <div class="">
      </div>
      <div class="flex gap-1">
        <button onClick={leaveRoom} class="btn">leave room</button>
        {(room.data?.leadId === user.data?.uid) && <button onClick={deleteRoom} class="btn">delete room</button>}
      </div>
    </div>
  </div >
}

const OtherUserScores = (props: { entries: [string, a][], idx: number, name: string }) => {
  const classes = [
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
  ]
  return <div class="flex flex-col items-center">
    <div>{props.name}</div>
    <For each={props.entries}>{([_, score]) =>
      <div class="flex items-center justify-center h-16">
        <div class="w-8 aspect-square flex items-center justify-center rounded-full"
          classList={{
            [classes[props.idx].main]: score.enabled,
            [classes[props.idx].second]: !score.enabled,
          }}
        >
          {score.value}
        </div>
      </div>
    }</For>
  </div>
}
