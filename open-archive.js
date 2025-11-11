// open-archive.js
// Firebase Storage의 폴더/파일을 리스트업하여 카드형으로 렌더링
// 필요조건: firebase-init.js에서 initializeApp(firebaseConfig) 이미 호출되어 있어야 함.

import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const app = getApp(); // 이미 초기화된 앱을 가져온다
const auth = getAuth(app);
const storage = getStorage(app);

const $auth = document.getElementById("authState");
const $result = document.getElementById("result");
const $empty = document.getElementById("empty");
const $pathInput = document.getElementById("pathInput");
const $depthSelect = document.getElementById("depthSelect");
const $open = document.getElementById("openBtn");
const $close = document.getElementById("closeBtn");

// 로그인 퍼시스턴스 보장 (GitHub Pages에서도 유지)
setPersistence(auth, browserLocalPersistence).catch(()=>{});

onAuthStateChanged(auth, (user) => {
  if (user) {
    $auth.textContent = `로그인됨: ${user.email ?? "사용자"}`;
  } else {
    $auth.textContent = "비로그인 상태 — Storage Rules가 로그인 필요하면 목록이 보이지 않습니다.";
  }
});

$open.addEventListener("click", async () => {
  const basePath = ($pathInput.value || "official").replace(/^\/+|\/+$/g,""); // 앞뒤 / 제거
  const depth = parseInt($depthSelect.value, 10) || 0;

  clearUI();
  setLoading(true);

  try {
    const items = await walk(basePath, depth);
    render(items);
  } catch (e) {
    console.error(e);
    renderError(e);
  } finally {
    setLoading(false);
  }
});

$close.addEventListener("click", () => {
  clearUI();
});

// ---- helpers ----

function setLoading(loading){
  if(loading){
    $empty.style.display = "block";
    $empty.textContent = "불러오는 중…";
  }else{
    $empty.textContent = "표시할 항목이 없습니다.";
  }
}

function clearUI(){
  $result.innerHTML = "";
  $empty.style.display = "none";
}

function renderError(err){
  $empty.style.display = "block";
  $empty.innerHTML = `불러오기 실패 😵<br><small>${(err && err.message) || err}</small>`;
}

function render(items){
  if(!items.length){
    $empty.style.display = "block";
    return;
  }
  const frag = document.createDocumentFragment();

  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = it.name;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = it.fullPath;
    card.appendChild(meta);

    const row = document.createElement("div");
    row.className = "row";

    const type = document.createElement("span");
    type.className = "badge";
    type.textContent = it.type;
    row.appendChild(type);

    if (it.url){
      const a = document.createElement("a");
      a.href = it.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn";
      a.textContent = "다운로드/열기";
      row.appendChild(a);
    }

    // 폴더(=prefix)는 하위 열기 버튼 제공
    if (it.type === "folder"){
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = "이 폴더 열기";
      btn.addEventListener("click", async () => {
        $pathInput.value = it.fullPath;
        $open.click();
        window.scrollTo({top:0,behavior:"smooth"});
      });
      row.appendChild(btn);
    }

    card.appendChild(row);
    frag.appendChild(card);
  });

  $result.appendChild(frag);
}

// basePath 기준으로 depth만큼 재귀적으로 탐색
async function walk(basePath, depth){
  const rootRef = ref(storage, basePath);
  const out = [];
  await _walk(rootRef, depth, out);
  return out;
}

async function _walk(dirRef, depth, out){
  const res = await listAll(dirRef);
  // 하위 폴더(prefix)
  for (const p of res.prefixes){
    out.push({ type:"folder", name: lastSeg(p.fullPath), fullPath: p.fullPath });
    if (depth > 0){
      await _walk(p, depth - 1, out);
    }
  }
  // 파일(items)
  for (const it of res.items){
    let url = null;
    try{
      url = await getDownloadURL(it);
    }catch(_){}
    out.push({ type:"file", name: lastSeg(it.fullPath), fullPath: it.fullPath, url });
  }
}

function lastSeg(path){
  const s = path.replace(/\/+$/,"").split("/");
  return s[s.length - 1] || "";
}

// 첫 로딩 시 기본 경로 세팅
document.addEventListener("DOMContentLoaded", () => {
  if(!$pathInput.value) $pathInput.value = "official";
});
