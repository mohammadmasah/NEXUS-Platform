import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Veuillez remplire tous les champs");
            return
        }

        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('toket_type', data.token_type);
            navigate("/profile");
        } else {
            alert('Les identifiants ne correspendent pas : ' + data.message);
        }
    }

    return (
        <div className=" bg-gray-100 h-screen w-screen flex flex-col items-center justify-center">

            <h1 className="text-8xl font-black text-gray-900 tracking-tighter leading-none">NEXUS</h1>
            <span className="text-2xl font-bold text-blue-600 tracking-[0.2em] uppercase mt-0.5">Platform</span>

            <div className="h-1/2 w-full md:w-1/2 xl:w-1/3 2xl:w-1/4 flex flex-col justify-center items-center">

                <form className="flex flex-col text-xl w-2/3 h-fit pb-5 gap-5 bg-zinc-200 rounded-xl border border-gray-400"
                    onSubmit={submit}>

                    <div className="flex flex-col mx-10 mt-10">
                        <label>Email</label>
                        <input className="rounded-md border border-black p-1 mt-2"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}></input>
                    </div>

                    <div className="flex flex-col mx-10 mt-5">
                        <label>Mot de passe</label>
                        <input className="rounded-md border border-black p-1 mt-2"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}></input>
                        <hr className="bg-black h-0.5 mt-10 w-11/12 self-center"></hr>
                    </div>


                    <button type="submit" className="bg-blue-600 mx-16 rounded-full mt-4 py-3">Valider</button>

                    <Link className="mx-auto" to='/register'>Créer un compte</Link>

                </form>


            </div>

        </div>
    );
}


export default Login;
