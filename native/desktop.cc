// native/desktop.cc
#include <napi.h>
#include <windows.h>

// Percorre todas as janelas procurando aquela que possui a SHELLDLL_DefView
BOOL CALLBACK enumProc(HWND topHandle, LPARAM lParam) {
  HWND defView = FindWindowExW(topHandle, NULL, L"SHELLDLL_DefView", NULL);
  if (defView) {
    // A WorkerW fica logo acima de Progman, irmão de SHELLDLL_DefView
    HWND* pWorker = (HWND*)lParam;
    *pWorker = FindWindowExW(NULL, topHandle, L"WorkerW", NULL);
    return FALSE; // pare de enumerar
  }
  return TRUE; // continue
}

Napi::Value setAsWallpaper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // 1) captura o HWND da janela Electron
  Napi::Buffer<void*> buf = info[0].As<Napi::Buffer<void*>>();
  HWND hwnd = (HWND)buf.Data();

  // 2) forçamos o Progman a criar a WorkerW
  HWND progman = FindWindowW(L"Progman", NULL);
  SendMessageTimeoutW(progman, 0x052C, 0, 0, SMTO_NORMAL, 1000, nullptr);

  // 3) encontramos essa WorkerW
  HWND workerw = NULL;
  EnumWindows(enumProc, (LPARAM)&workerw);

  if (workerw) {
    // 4) pai da nossa janela passa a ser a WorkerW
    SetParent(hwnd, workerw);
    // removemos bordas / sombras
    LONG style = GetWindowLongW(hwnd, GWL_STYLE);
    SetWindowLongW(hwnd, GWL_STYLE, style & ~WS_CAPTION);
  }

  return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("setAsWallpaper",
    Napi::Function::New(env, setAsWallpaper));
  return exports;
}

NODE_API_MODULE(desktop, Init)
