import { User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "solid-firebase";

export const _leaveRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  id: string,
): Promise<void> => {
  const docoData = (await getDoc(doc(db, 'rooms', id))).data();
  if (!!user.uid && docoData?.users) {
    const roomHasUser = !!docoData?.users[_makeUserName(user)]
    if (roomHasUser) {
      const { [_makeUserName(user)]: omitted, ...others } = docoData.users
      await updateDoc(doc(db, 'rooms', id), {
        users: others
      })
    }
  }
}

export const _deleteRoom = async (
  db: ReturnType<typeof getFirestore>,
  id: string,
) => {
  const ruSure = confirm('are you sure?')
  if (ruSure) {
    await deleteDoc(doc(db, 'rooms', id))
  }
}

function aDefault(value: number, enabled = true) {
  return {
    enabled: enabled,
    value,
  }
}
function defaults(props: { [k: string]: ReturnType<typeof aDefault> }) {
  return [
    aDefault(1),
    aDefault(1),
    //props,
    aDefault(2),
    aDefault(4),
    aDefault(1),
    aDefault(0.5),
    aDefault(1),
    aDefault(1.1),
  ]
}

export const _makeUserName = (user: User) => `${user.displayName}_${user.uid}`

export const _addRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomName: string,
): Promise<string> => {
  const doco = await addDoc(collection(db, 'rooms'), {
    name: roomName,
    leadId: user.uid,
    leadName: user.displayName,
    users: {
      [_makeUserName(user)]: [
        ...defaults({})
      ],
    }
  })
  return (await getDoc(doco)).id
}

export const _addUserToRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomId: string,
  dev: { [k: string]: ReturnType<typeof aDefault> }
) => {
  if (user.uid) {
    const doco = await getDoc(doc(db, 'rooms', roomId));
    const docoData = doco.data()
    const roomHasUser = !!doco.data()?.users[user.uid]
    if (!roomHasUser) {
      await updateDoc(doc(db, 'rooms', roomId), {
        users: {
          [_makeUserName(user)]: [
            ...defaults(dev)
          ],
          ...docoData?.users,
        },
      })
    }
  }
}

export const _updateUserScores = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomId: string,
  values: ReturnType<typeof defaults>,
  idx:number, 
) => {
  if (user.uid) {
    const doco = await getDoc(doc(db, 'rooms', roomId));
    const docoData = doco.data()
    const userData = doco.data()?.users[_makeUserName(user)]
    if (!!userData) {
      userData[idx] = values
      await updateDoc(doc(db, 'rooms', roomId), {
        users: {
          [_makeUserName(user)]: userData,
          ...docoData?.users,
        },
      })
    }
  }
}
