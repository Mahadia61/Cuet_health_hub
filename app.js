// 1. INITIALIZE SUPABASE
const SUPABASE_URL = "https://vgtnicoxzpkyobtpihoi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_77O6j1xEzWkugLccIE1RlQ_5Itk9XfO";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. SWITCH PAGES (Home <-> Login)
function showSection(sectionId) {
    document.getElementById('home-section').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById(sectionId + '-section').classList.remove('hidden');
}

// 3. HANDLE LOGIN
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector("button[onclick='handleLogin()']");

    // Simple validation
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Show loading state
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    // Send data to Supabase
    const { data, error } = await client.auth.signUp({
        email: email,
        password: password,
    });

    // Handle the result
    btn.innerText = originalText;
    btn.disabled = false;

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Success! Check your email (" + email + ") to confirm your account.");
    }
}