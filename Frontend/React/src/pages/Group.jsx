import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, MessageCircleMore, SquarePlus, ArrowBigLeft, Trash2 } from 'lucide-react';


export default function Group() {
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState([]);
    const [users, setUsers] = useState([]);
    const [addUser, setAddUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [groupName, setGroupName] = useState('');
    const { id } = useParams();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    const fetchGroups = async () => {
        const response = await fetch('http://localhost:8000/api/getGroups', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const data = await response.json();
            setGroups(data);
        }
    }


    const fetchUsers = async () => {

        const response = await fetch('http://localhost:8000/api/getAllUsers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    }




    const fetchGroup = async (id) => {

        const response = await fetch(`http://localhost:8000/api/group/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const data = await response.json();
            setGroup(data);
        }
    }


    const deleteGroup = async (id) => {

        const response = await fetch(`http://localhost:8000/api/deleteGroup/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }

        })

        if (response.ok) {
            navigate('/profile')

        }
    }


    const updateGroup = async (id) => {

        const response = await fetch(`http://localhost:8000/api/updateGroup/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({name : groupName})
        })
    }

    useEffect(() => {
        if (token) {
            fetchGroup(id);
            fetchGroups();
            fetchUsers();
        } else {
            navigate('/login');
        }
    }, []);

    if (!group.name) {
        return (
            <div>Loading</div>
        )
    }


    return (
        <div className="h-screen w-screen flex bg-gray-100 justify-between">
            <div className="w-1/12 bg-gray-100 flex flex-col gap-2.5 mt-5">

                <div className="flex justify-between mx-2 relative ">
                    <button onClick={() => navigate('/profile')}><ArrowBigLeft></ArrowBigLeft></button>
                    <button
                        onClick={() => setSettings(settings === null ? true : null)}><Settings></Settings></button>
                    {settings && (
                        <div>
                            <form onSubmit={() => updateGroup(id)}>
                                <input placeholder="Nom"
                                    onChange={(e) => setGroupName(e.target.value)}></input>
                                <button>Valider</button>
                            </form>
                        </div>
                    )}

                    <button type="submit"
                        onClick={() => deleteGroup(id)}><Trash2></Trash2></button>

                </div>
                <hr className=" border-black my-2"></hr>

                {groups.map(g =>
                    <button key={g.id} className="flex gap-2 border-2 border-gray-300 rounded-xl px-5 py-1 text-md font-bold items-center hover:bg-gray-300 hover:border-gray-500 w-fit"
                        onClick={() => navigate(`/group/${g.id}`)}>
                        <MessageCircleMore className="h-6"></MessageCircleMore>
                        <p>{g.name}</p>
                    </button>
                )}
            </div>

            <hr className="h-screen bg-black w-0.5"></hr>


            <div className="w-full"></div>


            <hr className="h-screen bg-black w-0.5"></hr>
            <div className="w-1/12 bg-gray-100 flex flex-col justify-right gap-2.5 mt-5">

                <div className=" flex mx-2">
                    <button onClick={() => setAddUser(addUser === null ? true : null)}><SquarePlus className="text-red-500 hover:text-red-700"></SquarePlus></button>
                </div>
                <hr className=" border-black my-2"></hr>
                {addUser && (
                    <div>
                        {users.map(users =>
                            <p>{users.first_name}</p>
                        )}
                    </div>
                )}
                {users.map(u =>
                    <button key={u.id} className="flex gap-2 border-2 border-gray-300 rounded-xl px-5 py-1 text-md font-bold items-center hover:bg-gray-300 hover:border-gray-500 w-fit">
                        <MessageCircleMore className="h-6"></MessageCircleMore>
                        <p>{u.first_name}</p>
                    </button>
                )}
            </div>
        </div>

    )

}