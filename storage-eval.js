import { app } from "./firebase-init.js";
import { 
  getStorage, ref, listAll, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage(app);

// ✅ 상위 폴더 (폴더 목록을 불러올 위치)
const baseRef = ref(storage, "official/isuja/운영패키지/훈련과정관리");

const toggleBtn = document.getElementById("toggleFilesBtn");
const fileListDiv = document.getElementById("fileList");

toggleBtn.addEventListener("click", () => {
  const hidden = fileListDiv.style.display === "none";
  fileListDiv.style.display = hidden ? "block" : "none";
  toggleBtn.textContent = hidden ? "닫기" : "열기";

  if (hidden) loadFolders();
});

function loadFolders() {
  listAll(baseRef).then((res) => {
    fileListDiv.innerHTML = "";

    // 📁 하위 폴더 리스트 표시
    res.prefixes.forEach((folder) => {
      const folderBtn = document.createElement("button");
      folderBtn.textContent = "📁 " + folder.name;
      folderBtn.style = "display:block; margin:6px 0; width:100%; text-align:left; background:none; border:none; cursor:pointer; font-size:15px;";

      folderBtn.onclick = () => loadFiles(folder.fullPath);
      fileListDiv.appendChild(folderBtn);
    });
  });
}

function loadFiles(folderPath) {
  const folderRef = ref(storage, folderPath);

  listAll(folderRef).then((res) => {
    fileListDiv.innerHTML = `<h4 style="margin-top:10px;">${folderPath}</h4>`;

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
