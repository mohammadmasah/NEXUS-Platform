import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, MessageCircleMore } from 'lucide-react';
import { MoreHorizontal, Edit2, Trash2, Image as ImageIcon, Send, Heart, MessageCircle, SquarePlus } from "lucide-react";



function Profile() {

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('')
    const [avatar, setAvatar] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');

    const [openMenuId, setOpenMenuId] = useState(null);
    const [editUserForm, setEditUserForm] = useState(null);
    const [groupForm, setGroupForm] = useState(null);

    const [deleteUserForm, setDeleteUserForm] = useState(null);



    const [posts, setPosts] = useState([]);


    const [likedPosts, setLikedPosts] = useState({});
    const [commentTexts, setCommentTexts] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);




    // User info

    const loadUser = async () => {
        const response = await fetch('http://localhost:8000/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data);
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setAvatar(data.avatar);
            setEmail(data.email);
        }
    };

    const loadPosts = async () => {

        const response = await fetch('http://localhost:8000/api/getUserPosts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.ok) {
            const data = await response.json();
            setPosts(data);
        }
    }


    useEffect(() => {

        if (token) {

            loadUser();
            loadPosts();
            fetchGroups();

        } else {
            navigate('/login');
        }

    }, []);



    // Update Profile
    const UpdateProfile = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('email', email);

        if (avatar instanceof File) {
            formData.append('avatar', avatar);
        }

        formData.append('_method', 'PUT');

        const response = await fetch('http://localhost:8000/api/user/update', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })

        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            window.location.reload();
        }

    }




    // Logout
    const logout = async () => {

        const response = await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');

            navigate('/login');
        };

    }



    //Delete user
    const DeleteUser = async (deleteContent) => {

        const response = await fetch('http://localhost:8000/api/user/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

            body: JSON.stringify({ delete_content: deleteContent })

        });

        if (response.ok) {
            localStorage.removeItem('token');
            alert('Compte supprmié');
            navigate('/register');
        };
    };

    const DeleteAll = async () => {

        const response = await fetch('', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            alert('Compte supprimée');
            navigate('/register');
        }
    }


    //Time management
    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diff = Math.floor((now - postDate) / 1000);

        if (diff < 60) return "A'instant";
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;

        return "Il y a 1 semain";
    };

    //Like and Dislike
    const toggleLike = (postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    //Delete the Posts
    const deletePost = async (postId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette publication ?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/deletePost/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                loadPosts();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du post', error);
        }
    };

    //Edit the Posts
    const updatePost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/editPost/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editContent })
            });
            if (response.ok) {
                setEditingPostId(null);
                loadPosts();
            }
        } catch (error) {
            console.error('Erreur lors de la modification du post', error);
        }
    };

    //Send new comment
    const handleComment = async (postId) => {
        const text = commentTexts[postId];
        if (!text?.trim()) return;

        try {
            const response = await fetch(`http://localhost:8000/api/post/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`

                },
                body: JSON.stringify({ content: text })
            });
            if (response.ok) {
                setCommentTexts(prev => ({ ...prev, [postId]: '' }));
                loadPosts();
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du commentaire", error);
        }
    };

    //Delete the Comments

    const deleteComment = async (postId, commentId) => {

        if (!commentId) return;


        if (!window.confirm("Voulez-vous supprimer ce commentaire ?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/post/${postId}/deleteComment/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                loadPosts();
            } else if (response.status === 403) {
                alert("");
            }
        } catch (error) {
            console.error('Erreur suppression commentaire', error);
        }
    };


    // Get groups
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



    const createGroup = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8000/api/createGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: groupName
            })
        })

        if (response.ok) {
            fetchGroups();  
            setGroupForm(null);          
        }
    }


    if (!user || !groups) {
        return (
            <p>Loading</p>
        )
    }






    // HTML
    return (

        < div className="min-h-screen bg-gray-100">
            <nav className="pt-3 px-4 max-w-5xl mx-auto flex justify-between items-center relative bg-gray-100">

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">NEXUS</h1>
                        <span className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-0.5">Platform</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end border-r border-gray-100 pr-4">
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-medium text-gray-400">En ligne</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-blue-500/20 overflow-hidden
                            cursor-pointer hover:ring-blue-500/50 transition-all shadow-md active:scale-90">
                            <img src={`http://localhost:8000/storage/${user.avatar}`}></img>

                        </div>
                    </div>
                </div>
            </nav>


            {/* PROFILE */}
            <div className="w-screen flex flex-col items-center">

                <div className="bg-white rounded-xl border border-gray-200-5 p-4 mb-6 mt-10 lg:w-2/5 w-4/5 flex justify-between shadow-lg shadow-cyan-500/50">
                    <div className="flex ">
                        <img className="w-20 h-20 rounded-full border-4" src={`http://localhost:8000/storage/${user.avatar}`}></img>
                        <div className="flec flex-col mx-5">
                            <p className="md:text-4xl text-2xl">{user.first_name} {user.last_name}</p>
                            <p className="mt-2 mx-2 md:text-xl ">{user.email}</p>
                        </div>
                    </div>
                    <div className="relative">

                        <Settings type="button" className="self-end opacity-50 hover:opacity-100"
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}></Settings>

                        {openMenuId === user.id && (
                            <div className="absolute right-0 mt-0 bt-white rounded-ld shadow-md border bg-white">

                                <button
                                    className="w-full flex items-center gap-2 p-2 text-lg hover:bg-gray-100"
                                    onClick={() => setEditUserForm(editUserForm === user.id ? null : user.id)}>
                                    <p>Modifier</p>
                                </button>

                                <button
                                    className="w-full flex items-center gap-2 p-2 text-lg text-red-500 hover:bg-gray-100"
                                    onClick={logout}>
                                    <p>Déconnecter</p>
                                </button>

                                <button
                                    className="w-full flex items-center gap-2 p-2 text-lg  text-red-500 hover:bg-gray-100"
                                    onClick={() => setDeleteUserForm(deleteUserForm === user.id ? null : user.id)}>
                                    <p>Supprimer</p>
                                </button>

                            </div>

                        )}

                    </div>
                </div>


                {editUserForm === user.id && (
                    <div className="absolute right-0 mx-5 my-5 w-full h-full bg-black/25 flex justify-center items-center">
                        <form className="flex flex-col text-xl w-2/3 h-fit pb-5 gap-5 bg-zinc-200 rounded-xl border border-gray-400">

                            <div className="flex flex-col mx-10 mt-10">
                                <label>Prénom</label>
                                <input className="rounded-md border border-black p-1 mt-2"
                                    type="text"
                                    onChange={(e) => setFirstName(e.target.value)}></input>
                            </div>

                            <div className="flex flex-col mx-10 mt-10">
                                <label>Nom</label>
                                <input className="rounded-md border border-black p-1 mt-2"
                                    type="text"
                                    onChange={(e) => setLastName(e.target.value)}></input>
                            </div>



                            <div className="flex flex-col mx-10 mt-10">
                                <label>Email</label>
                                <input className="rounded-md border border-black p-1 mt-2"
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}></input>
                            </div>

                            <div className="flex flex-col mx-10 mt-10">
                                <label>Mot de passe</label>
                                <input className="rounded-md border border-black p-1 mt-2"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}></input>
                            </div>

                            <div className="flex flex-col mx-10 mt-10">
                                <label className="mx-5">Photo</label>
                                <input type="file"
                                    className="m-3"
                                    onChange={(e) => setAvatar(e.target.files[0])}></input>
                            </div>




                            <button type="submit" className="bg-blue-600 mx-16 rounded-full mt-4 py-3"
                                onClick={UpdateProfile}>Valider</button>


                        </form>
                    </div>
                )}


                {deleteUserForm === user.id && (
                    <div className="absolute right-0 mx-5 my-5 w-full h-full bg-black/25 flex justify-center items-center gap-5">

                        <button className="bg-gray-200 p-1 rounded text-xl"
                            onClick={() => DeleteUser(false)}>Supprimer le compte</button>

                        <button className="bg-gray-200 p-1 rounded text-xl"
                            onClick={() => DeleteUser(true)}>Supprimer le contenue</button>

                    </div>
                )}


                {/* GROUPS */}

                <div className="lg:w-2/5 w-4/5 flex flex-wrap gap-5">

                    {groupForm === user.id && (
                        <div>
                            <form className=" flex gap-2 border-2 border-gray-300 rounded-xl px-5 py-1 text-md font-bold items-center"
                                onSubmit={createGroup}>

                                <input className="bg-gray-100 hover:bg-gray-200 border border-cyan-500 rounded px-1" placeholder="Nom de groupe"
                                    onChange={(e) => setGroupName(e.target.value)}></input>

                                <button type="submit" className="border border-cyan-500 bg-gray-100 hover:bg-gray-200 px-3 rounded">Valider</button>

                            </form>
                        </div>
                    )}

                    <button onClick={() => setGroupForm(groupForm === user.id ? null : user.id)}><SquarePlus className="text-cyan-500 hover:text-cyan-700"></SquarePlus></button>

                    {groups.map(g =>
                        <button className="flex gap-2 border-2 border-gray-300 rounded-xl px-5 py-1 text-md font-bold items-center hover:bg-gray-300 hover:border-gray-500"
                            onClick={() => navigate(`/group/${g.id}`)}>
                            <MessageCircleMore className="h-6"></MessageCircleMore>
                            <p>{g.name}</p>
                        </button>
                    )}
                </div>


                {/* POSTS */}
                <div className="space-y-4 p-4 mb-6 mt-10 2xl:w-2/5 lg:w-3/5 md:w-9/12 w-11/12 ">

                    <div>
                        <h2 className="text-4xl mx-3">Activité</h2>
                        <hr className="my-3"></hr>
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic bg-white rounded-2xl border border-dashed
                         border-gray-200">Aucune publication pour le moment...
                        </div>
                    )}

                    {posts.map((post) => (
                        <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                            <header className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.user?.id}`)}>
                                    <img
                                        src={`http://localhost:8000/storage/${user.avatar}`}
                                        className="w-11 h-11 rounded-full border-2 border-gray-50"
                                        alt="Avatar"
                                    />
                                    <div>
                                        <h2 className="font-bold text-sm text-gray-900">{post.user?.first_name} {post.user?.last_name}</h2>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">{formatRelativeTime(post.created_at)}</p>
                                    </div>
                                </div>

                                {post.user_id === userId && (
                                    <div className="relative">

                                        <button onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <MoreHorizontal size={20} className="text-gray-500" />
                                        </button>

                                        {openMenuId === post.id && (
                                            <div className="absolute right-0 mt-0 w-20 bt-white rounded-ld shadow-md border">

                                                <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setOpenMenuId(null); }}
                                                    className="w-full flex items-center gap-2 p-2 text-xs hover:bg-gray-100">
                                                    <p>Modifier</p>
                                                </button>

                                                <button onClick={() => { deletePost(post.id); setOpenMenuId(null); }}
                                                    className="w-full flex items-center gap-2 p-2 text-xs text-red-500 hover:bg-gray-100">
                                                    <p>Supprimer</p>
                                                </button>

                                            </div>
                                        )}
                                    </div>
                                )}
                            </header>

                            <div className="px-5 pb-5">

                                {editingPostId === post.id && (
                                    <div className="space-y-3 bg-blue-50 p-3 rounded-xl border border-blue-100">

                                        <textarea className="w-full p-3 b border-none rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200
                                    resize-none shadow-sm"
                                            rows="3"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}></textarea>

                                        <div className="flex-gap-2 justify-end">
                                            <button onClick={() => updatePost(post.id)} className="bg-blue-600 text-white
                                        px-4 py-1.5 rounded-lg text-xs font-bold">Sauvegarder</button>
                                            <button onClick={() => setEditingPostId(null)} className="bg-gray-200">Annuler</button>
                                        </div>

                                    </div>
                                )}
                            </div>

                            {editingPostId !== post.id && (
                                <>
                                    <p className="ml-5 mb-5 text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    {post.image && (
                                        <div className="m-5">
                                            <img
                                                className=" rounded-lg "
                                                src={`http://localhost:8000/storage/${post.image}`}
                                                alt="post"
                                            />
                                        </div>
                                    )}                                 </>
                            )}

                            <div className="flex border-y border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={() => toggleLike(post.id)}
                                    className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-2 transition-all
                                        ${likedPosts[post.id]}`}>
                                    <Heart
                                        size={18}
                                        fill={likedPosts[post.id] ? "currentColor" : "none"}
                                        className={likedPosts[post.id] ? "text-red-600" : "text-gray-500"}
                                    ></Heart>
                                </button>
                            </div>


                            <footer className="bg-gray-50/40 p-4">

                                <div className="flex gap-3 mb-5">
                                    <input
                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                                        placeholder="Écrire un commentaire..."
                                        value={commentTexts[post.id] || ""}
                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                                    />
                                    <button onClick={() => handleComment(post.id)} className="text-blue-600 text-[11px] font-black uppercase hover:scale-105 transition-transform">
                                        Envoyer
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {post.comments?.map(com => (
                                        <div key={com.id} className="flex flex-col bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-[11px] text-blue-900">{com.user?.first_name} {com.user?.last_name}</span>
                                                {com.user_id === userId && (
                                                    <button onClick={() => deleteComment(post.id, com.id)} className="text-[9px] text-red-400 font-bold hover:underline">
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[12px] text-gray-700 leading-snug">{com.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </footer>

                        </article>
                    ))}



                </div>

            </div >

        </div>

    );

}

export default Profile;
