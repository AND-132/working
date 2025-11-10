import { app } from "./firebase-init.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { auth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  if (!user) location.href = "./login.html";  // 로그인 안 되어있으면 접근 불가
});

document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("파일을 선택하세요.");

  // 파일 확장자 검사
  const allowed = ["pdf","hwp","xlsx","docx"];
  const ext = file.name.split(".").pop().toLowerCase();
  if (!allowed.includes(ext)) return alert("허용 형식만 업로드 가능(PDF, HWP, XLSX, DOCX)");

  const fileRef = ref(storage, "archives/" + Date.now() + "_" + file.name);
  await uploadBytes(fileRef, file);

  alert("업로드 완료 ✅");
  location.href = "./files.html";
};
