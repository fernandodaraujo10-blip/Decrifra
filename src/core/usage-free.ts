const DAILY_LIMIT = 3;
const MONTHLY_LIMIT = 30;

function getUsage() {
    const data = localStorage.getItem("usage_free");
    return data ? JSON.parse(data) : {
        daily: 0,
        monthly: 0,
        lastDay: new Date().getDate(),
        lastMonth: new Date().getMonth()
    };
}

function saveUsage(usage: any) {
    localStorage.setItem("usage_free", JSON.stringify(usage));
}

export function canSearch(): boolean {
    const now = new Date();
    let usage = getUsage();

    // Reset diário
    if (usage.lastDay !== now.getDate()) {
        usage.daily = 0;
        usage.lastDay = now.getDate();
    }

    // Reset mensal
    if (usage.lastMonth !== now.getMonth()) {
        usage.monthly = 0;
        usage.lastMonth = now.getMonth();
    }

    saveUsage(usage);

    if (usage.daily >= DAILY_LIMIT) return false;
    if (usage.monthly >= MONTHLY_LIMIT) return false;

    return true;
}

export function registerSearch() {
    let usage = getUsage();
    usage.daily += 1;
    usage.monthly += 1;
    saveUsage(usage);
}
