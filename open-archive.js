// open-archive.js
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { app } from "./firebase-init.js"; // 경로 동일확인 (index.html / official.html 의 firebase-init 위치 기준)

const storage = getStorage(app);

// ✅ Firebase Storage 폴더 경로 (그대로 작성해야 함)
const folderPath = "official/isuja/운영패키지/훈련과정관리/01훈련운영";

const listRef = ref(storage, folderPath);

// ✅ 파일 목록을 표시할 컨테이너
const container = document.getElementById("file-list");
container.innerHTML = "<p>📂 파일 불러오는 중...</p>";

listAll(listRef)
  .then((res) => {
    container.innerHTML = ""; // 기존 내용 삭제

    // ✅ 폴더 내부 파일 반복
    res.items.forEach((itemRef) => {
      getDownloadURL(itemRef).then((url) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("file-item");

        wrapper.innerHTML = `
          <a href="${url}" target="_blank" class="file-link">
            ${itemRef.name}
          </a>
        `;

        container.appendChild(wrapper);
      });
    });

    // ✅ 하위 폴더가 있는 경우 (옵션)
    res.prefixes.forEach((folderRef) => {
      const folderBtn = document.createElement("button");
      folderBtn.textContent = `📁 ${folderRef.name}`;
      folderBtn.onclick = () => {
        window.location.href = `./archive.html?folder=${folderRef.fullPath}`;
      };
      container.appendChild(folderBtn);
    });
  })
  .catch((error) => {
    container.innerHTML = "<p>❌ 파일 목록 불러오기 실패</p>";
    console.error(error);
  });
