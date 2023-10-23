import { debounce } from "@solid-primitives/scheduled";
import { getAuth } from "firebase/auth";
import { doc, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { Accessor, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate, useParams } from "solid-start";
import { Input } from "~/components/input";
import { a, _deleteRoom, _labels, _leaveRoom, _makeUserName, _reserScore, _updateUserScores } from "~/utils/rooms";

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
  const zxcd = (init: string) => (acc: string, idv: a, idx: number, arr: a[]) => {
    if ((arr.length - 1) === idx) return acc
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
    const zxcv = Object.values(userScoresLabels()).reduce(zxcd(""), "") + qwer + jkl;
    navigator.clipboard.writeText(zxcv);
  }

  const reset = async () => {
    const ruSure = confirm('do you wish to reset the estimates?')
    if (ruSure) {
      await _reserScore(db, params.id)
    }
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
  const userScores = createMemo((): { [k: string]: a } => user.data?.uid ? room.data?.users[_makeUserName(user.data)] : {})
  const userScoresLabels = createMemo(() => _labels.map(l => userScores()?.[l]))
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

  return <div class="flex flex-col gap-4 max-h-full min-h-max w-full">
    <Show when={room.data && !room.loading}
      fallback={
        <span class="loading loading-ring loading-lg"></span>
      }
    >
      <h3 class="text-2xl font-bold">{room.data?.name}</h3>
      <div class="w-full h-full overflow-auto">
        <div class="flex gap-8 h-max w-full min-w-max">
          <div class="flex flex-col w-[400px] h-max sticky z-40 bg-base-100 left-0">
            <div class="bg-base-100 top-0 sticky z-[45]">{user.data?.displayName}</div>
            {userScores() && <For each={userScoresLabels()}>
              {(l, idx) => {
                const [mut, setMut] = createSignal<a>({} as a)
                createEffect(() => setMut(l))
                const setMutEnabled = (enabled: boolean) => {
                  const q = JSON.parse(JSON.stringify(mut()))
                  q.enabled = enabled
                  setMut(q)
                }
                const setMutValue = (value: number) => {
                  const q = JSON.parse(JSON.stringify(mut()))
                  q.value = value
                  setMut(q)
                }
                const trigger = debounce(async () => {
                  user.data &&
                    await _updateUserScores(user.data, db, params.id, _labels[idx()], mut())
                }, 500)
                return <div class="flex gap-4 h-16 items-center justify-between">
                  <div class="form-control sticky bg-base-100 left-0">
                    <label class="label cursor-pointer flex gap-2">
                      <input
                        class="checkbox"
                        type="checkbox"
                        checked={l.enabled}
                        onChange={(e) => { setMutEnabled(e.target.checked); trigger() }} />
                      <span class="label-text">{_labels[idx()]}</span>
                    </label>
                  </div>
                  <input
                    class="input text-white input-bordered w-24 input-primary"
                    placeholder="estim8"
                    type="number"
                    disabled={!l.enabled}
                    pattern="\d*"
                    value={l.value}
                    onInput={(e) => { setMutValue(parseFloat(e.currentTarget.value)); trigger() }}
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
      </div>
      {!room.loading && room.data && <div class="flex gap-4 sticky bottom-0 left-0 z-50 items-end bg-base-100 pt-2">
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
        <button class="btn" onClick={reset}>Reset</button>
      </div>
      }
    </Show>
    <div class="flex flex-col gap-1 items-end absolute right-4 z-[60] bottom-4">
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
    // { main: 'bg-primary text-primary-content', updated: 'bg-primary-focus text-primary-focus-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-50', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-50', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-50', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-50', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-50', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-50', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content opacity-50', updated: 'bg-primary-focus text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-50', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-50', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-50', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-50', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-50', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-50', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content opacity-50', updated: 'bg-primary-focus text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-50', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-50', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-50', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-50', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-50', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-50', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
  ]
  return <div class="flex flex-col items-center h-max">
    <div class="sticky top-0 bg-base-100 z-20 w-full text-center">{props.name}</div>
    <For each={props.entries}>{([_, score]) =>
      <div class="flex items-center justify-center h-16">
        <div class="w-8 aspect-square flex items-center justify-center rounded-full cursor-default"
          classList={{
            [classes[props.idx].main]: score.enabled && !score.updated,
            [classes[props.idx].updated]: score.enabled && score.updated,
            [classes[props.idx].second]: !score.enabled,
          }}
        >
          {score.value}
        </div>
      </div>
    }</For>
  </div>
}
