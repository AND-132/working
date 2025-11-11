import { app } from "./firebase-init.js";
import { 
  getStorage, ref, listAll, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage(app);

// ✅ 너가 Firebase에 만든 폴더 경로 그대로
const folderRef = ref(storage, "official/isuja/운영패키지/훈련과정관리");

const toggleBtn = document.getElementById("toggleFilesBtn");
const fileListDiv = document.getElementById("fileList");

toggleBtn.addEventListener("click", () => {
  const isHidden = fileListDiv.style.display === "none";
  fileListDiv.style.display = isHidden ? "block" : "none";
  toggleBtn.textContent = isHidden ? "닫기" : "열기";
  if (isHidden) loadFiles();
});

function loadFiles() {
  listAll(folderRef).then((res) => {
    fileListDiv.innerHTML = "";
    res.items.forEach((file) => {
      getDownloadURL(file).then((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = "📄 " + file.name;
        link.style.display = "block";
        link.style.margin = "6px 0";
        fileListDiv.appendChild(link);
      });
    });
  });
}
