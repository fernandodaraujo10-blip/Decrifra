
const CURRENT_VERSION = "1.0.3";

export async function checkAppVersion() {
    try {
        // nocache garante que o fetch ignore o cache do navegador e pegue o arquivo real do servidor
        const response = await fetch("/version.json?nocache=" + Date.now(), {
            cache: "no-store",
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.version && data.version !== CURRENT_VERSION) {
            console.log(`Nova versão detectada: ${data.version}. Versão atual: ${CURRENT_VERSION}`);
            forceUpdate();
        }
    } catch (error) {
        console.error("Erro ao verificar versão:", error);
    }
}

async function forceUpdate() {
    // 1. Limpar localStorage
    localStorage.clear();

    // 2. Limpar Caches do navegador (Service Worker e outros)
    if ('caches' in window) {
        try {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
        } catch (e) {
            console.error("Erro ao limpar cache:", e);
        }
    }

    // 3. Notificar usuário e recarregar
    alert("Nova versão disponível. Atualizando aplicativo para garantir o melhor desempenho...");

    // Forçar recarregamento ignorando cache do navegador
    window.location.reload();
}
