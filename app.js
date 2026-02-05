// 1. INITIALIZE SUPABASE
// KEEP YOUR KEYS FROM BEFORE!
const SUPABASE_URL = "https://vgtnicoxzpkyobtpihoi.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_77O6j1xEzWkugLccIE1RlQ_5Itk9XfO";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. SWITCH PAGES
function showSection(sectionId) {
    document.getElementById('home-section').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById(sectionId + '-section').classList.remove('hidden');
}

// 3. HANDLE SIGN UP & LOGIN
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector("button[onclick='handleLogin()']");

    if (!email || !password) return alert("Please enter email and password.");

    btn.innerText = "Checking...";
    btn.disabled = true;

    // STEP A: Try to Log In
    const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
        email: email,
        password: password,
    });

    // STEP B: If Log In fails, try to Sign Up
    if (loginError) {
        console.log("Login failed, trying signup...");
        
        // 1. Create User in Auth
        const { data: signupData, error: signupError } = await client.auth.signUp({
            email: email,
            password: password,
        });

        if (signupError) {
            alert("Error: " + signupError.message);
            resetButton();
            return;
        }

        // 2. Add to 'profiles' table with is_approved = FALSE
        const { error: profileError } = await client
            .from('profiles')
            .insert([{ email: email, is_approved: false }]);

        if (profileError) console.error("Profile error:", profileError);

        alert("Account created! Please wait for Admin Approval before logging in.");
        resetButton();
        return;
    }

    // STEP C: User Logged in successfully. NOW CHECK APPROVAL.
    const { data: profileData, error: profileFetchError } = await client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileFetchError || !profileData) {
        // If profile is missing, create one (fallback)
        await client.from('profiles').insert([{ email: email, is_approved: false }]);
        alert("Account pending approval.");
        await client.auth.signOut(); // Kick them out
    } else if (profileData.is_approved === false) {
        // BLOCKED!
        alert("🚫 Your account is waiting for Admin Approval. Please contact the medical center.");
        await client.auth.signOut(); // Kick them out
    } else {
        // APPROVED!
        alert("✅ Welcome back, " + email);
        // Here you would redirect to the Dashboard
        showSection('home'); 
    }
    
    resetButton();
}

function resetButton() {
    const btn = document.querySelector("button[onclick='handleLogin()']");
    btn.innerText = "Login / Sign Up";
    btn.disabled = false;
}