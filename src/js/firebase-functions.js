const testCompleted = firebase.functions().httpsCallable("testCompleted");
const addTag = firebase.functions().httpsCallable("addTag");
const editTag = firebase.functions().httpsCallable("editTag");
const removeTag = firebase.functions().httpsCallable("removeTag");
const updateResultTags = firebase.functions().httpsCallable("updateResultTags");
const saveConfig = firebase.functions().httpsCallable("saveConfig");
const generatePairingCode = firebase
  .functions()
  .httpsCallable("generatePairingCode");
const saveLbMemory = firebase.functions().httpsCallable("saveLbMemory");
const unlinkDiscord = firebase.functions().httpsCallable("unlinkDiscord");
const verifyUser = firebase.functions().httpsCallable("verifyUser");
const reserveName = firebase.functions().httpsCallable("reserveDisplayName");
const updateEmail = firebase.functions().httpsCallable("updateEmail");
