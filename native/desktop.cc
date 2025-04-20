#include <napi.h>
#include <windows.h>

// Encontra a janela WorkerW / Progman do desktop
static HWND findWallpaperWindow() {
  // Chama a versão wide-char
  HWND progman = FindWindowW(L"Progman", NULL);
  // Envia a mensagem para criar WorkerW
  SendMessageTimeoutW(progman, 0x052C, 0, 0, SMTO_NORMAL, 100, nullptr);

  HWND worker = NULL;
  EnumWindows(
    [](HWND top, LPARAM lParam) -> BOOL {
      // Procura a SHELLDLL_DefView (wide-char)
      HWND sv = FindWindowExW(top, nullptr, L"SHELLDLL_DefView", nullptr);
      if (sv) {
        HWND *pWorker = reinterpret_cast<HWND*>(lParam);
        // A janela WorkerW é filha do topo
        *pWorker = FindWindowExW(nullptr, top, L"WorkerW", nullptr);
        return FALSE;  // para o EnumWindows
      }
      return TRUE;     // continuará procurando
    },
    reinterpret_cast<LPARAM>(&worker)
  );
  return worker ? worker : progman;
}

Napi::Value Attach(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!info[0].IsNumber()) return env.Null();
  // Obtém o HWND (número) passado do JS
  HWND hwnd = reinterpret_cast<HWND>(static_cast<uintptr_t>(info[0].As<Napi::Number>().Int64Value()));
  HWND wp   = findWallpaperWindow();
  SetParent(hwnd, wp);
  return env.Undefined();
}

Napi::Value Detach(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!info[0].IsNumber()) return env.Null();
  HWND hwnd = reinterpret_cast<HWND>(static_cast<uintptr_t>(info[0].As<Napi::Number>().Int64Value()));
  SetParent(hwnd, NULL);
  return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("attach", Napi::Function::New(env, Attach));
  exports.Set("detach", Napi::Function::New(env, Detach));
  return exports;
}

NODE_API_MODULE(desktop, Init)
