import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ButtonPost from "../components/ButtonPost";
import { MoreHorizontal, Image as ImageIcon, Heart,Search,Pencil, Trash2, } from "lucide-react";


function Home() {
    // Memory section (States)
    const [posts, setPost] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [imagePost, setImagePost] = useState(null)
    const [likedPosts, setLikedPosts] = useState({});
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [commentTexts, setCommentTexts] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    //1: To get information from the server
    const loadPosts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/getAllPosts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPost(data);
            }

            else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error connecting to server', error);
        }
    }
    //
    const fetchUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserId(data.id);
                setUserProfile(data);
            }
        } catch (error) {
            console.error("Erreur fetch user:", error);
        }
    };
    //2: Auto-run when page opens
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
        else {
            loadPosts();
            fetchUser();
        }
    }, []);
    //3: New Post

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setImagePost(file);
    }

    const submit = async (e) => {

        e.preventDefault();

        if (!newPost.trim()) return;

        const formData = new FormData();

        formData.append('content', newPost);

        if (imagePost instanceof File) {
            formData.append('image', imagePost);
        }

        try {
            const response = await fetch('http://localhost:8000/api/createPost', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (response.ok) {

                setNewPost("");
                loadPosts();
            }
        } catch (error) {
            console.error("Error during publication:", error);
        }

    };
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
    return (
        //Logo and branding
        <>
        

            <nav className="mt-3 mb-3 px-4 max-w-5xl mx-auto flex justify-between items-center relative">

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="flex flex-col" onClick={() => navigate('/home')}>
                        
                        <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">NEXUS</h1>
                        <span className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-0.5">Platform</span>
                    </div>
                    {/* Rechercher Section*/}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher"
                            className="w-full pl-12 ml-2 py-2 bg-white border border-gray-300 rounded-2xl outline-none text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
{/*Home and Chat*/}
                <div className="hidden md:flex items-center gap-6 border-l border-gray-200 pl-6 ml-4">
                    <button onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-gray-600 py-1">
                            
                        <span className="text-xs font-bold uppercase tracking-wider">Home</span>
                    </button>

                    <button onClick={() => navigate('/Group')}
                            className=" flex items-center gap-2 text-gray-600 py-1">
                                
                            <span className="text-xs font-bold uppercase tracking-wider">Chat</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end border-r border-gray-100 pr-4">
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-medium text-gray-400">En ligne</span>
                        </div>
                    </div>
                        {/*profile image in Home page */}
                 <div className="relative" onClick={() => navigate('/profile')}>
                    <div className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-blue-500/20 overflow-hidden cursor-pointer bg-gray-100">
                        
                        {userProfile?.avatar && (
                            <img 
                                src={`http://localhost:8000/storage/${userProfile.avatar}`} 
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                        )}

                        {!userProfile?.avatar && (
                            <img 
                                src={`https://ui-avatars.com/api/?name=${userProfile?.first_name}`} 
                                className="w-full h-full object-cover"
                                alt="Default"
                            />
                        )}

                    </div>
                </div>
                </div>
            </nav>

            <main className="space-y-6 p-4 xl:w-[600px] lg:w-[550px] md:w-9/12 w-full m-auto">

                {/* Post Creator*/}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">

                    <form onSubmit={submit}>

                        <textarea
                            className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none text-sm text-gray-700 resize-none focus:ring-1 focus:ring-blue-100"
                            placeholder={`Quoi de neuf, ${userProfile?.first_name} ?`}
                            rows="3"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setImagePost(e.target.files[0])}
                                accept="image/*"
                                className="hidden"></input>

                            <button type="button" className="flex itmes-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50
                                text-blue-600 transition-all group"
                                onClick={() => fileInputRef.current.click()}>
                                <ImageIcon size={20} className="group-hover:scale-110 transition-transform"></ImageIcon>
                                <span className="hidden md:block text-[13px] font-semibold">Photo</span>
                            </button>

                            <ButtonPost
                                Arg="Publier"
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all active:scale-95"
                            />
                        </div>

                    </form>
                </div>
                {/*For the post that not availble for shere the user post*/}
                <div className="space-y-4">

                    {posts.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic bg-white rounded-2xl border border-dashed
                         border-gray-200">Aucune publication pour le moment...
                        </div>
                    )}
                    
                    {/*For shere the Posts */}
                    {/*Serech Posts and Users */}
                    {posts
                        .filter(p => p.content?.toLowerCase().includes(searchTerm.toLowerCase()) || p.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((post) => (

                        <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                            <header className="p-4 flex justify-between items-center">
                                
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile`)}>
                                        <img
                                            src={post.user?.avatar 
                                                ? `http://localhost:8000/storage/${post.user.avatar}` 
                                                : `https://ui-avatars.com/api/?name=${post.user?.first_name}&background=0D8ABC&color=fff`
                                            }
                                            className="w-11 h-11 rounded-full border-2 border-gray-50 object-cover shadow-sm"
                                            alt="Avatar"
                                        />
                                    <div>
                                        <h2 className="font-bold text-sm text-gray-900">{post.user?.first_name} {post.user?.last_name}</h2>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">{formatRelativeTime(post.created_at)}</p>
                                    </div>
                                </div>

                                {/*Dots  Icone in the Psot */}
                                {post.user_id === userId && (
                                    <div className="relative">

                                        <button onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <MoreHorizontal size={20} className="text-gray-500" />
                                        </button>

                                        {/*Table for Edite and Delete the posts */}
                                        {openMenuId === post.id && (
                                            <div className="absolute right-0 w-36 bg-white rounded-xl shadow-xl border border-gray-100  overflow-hidden ">

                                                <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setOpenMenuId(null); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                        <Pencil size={15} strokeWidth={2.5} />
                                                    <p>Modifier</p>
                                                </button>

                                                <button onClick={() => { deletePost(post.id); setOpenMenuId(null); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                                                        <Trash2 size={15} strokeWidth={2.5} />
                                                    <p>Supprimer</p>
                                                </button>

                                            </div>
                                        )}
                                    </div>
                                )}
                            </header>
                            
                            {/*Button in Edite button for save or cancel the masioin*/}
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
                                        px-4 py-1.5 rounded-lg text-xs font-bold ">Sauvegarder</button>
                                            <button onClick={() => setEditingPostId(null)} className="bg-gray-200 ml-3 rounded-lg px-3 py-0.8 ">Annuler</button>
                                        </div>

                                    </div>
                                )}
                            </div>
                            {/*Texts section */}
                            {editingPostId !== post.id && (
                                <>
                                    <p className="ml-5 mb-5 text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                </>
                            )}
                            
                            {/*Images section*/}
                            {post?.image && (
                                <div className="w-full bg-[#f3f2f0] border-y border-gray-100 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`http://localhost:8000/storage/${post.image}`} 
                                        alt="Post content"
                                        className="max-w-full h-auto max-h-[550px] object-contain"
                                        onError={(e) => e.target.closest('div').style.display = 'none'}
                                    />
                                </div>
                            )}
                            {/*Icone like from the Library (lucide-react)*/}
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

                            {/*Part of Add Comments and Delete comments */}

                            <footer className="bg-gray-50 p-4">
                                <div className="flex gap-3 mb-5">
                                    <input className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs outline-none
                                    focus:ring-2 focus:ring-blue-100 shadow-sm"
                                        placeholder="Ecrir un commentaire..."
                                        value={commentTexts[post.id] || ""}
                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} />

                                    <button onClick={() => handleComment(post.id)}
                                        className="text-blue-600 text-[11px] font-black uppercase hove:scale-105 transition-transform">Envoyer</button>
                                </div>
                                {/*Delete Comments*/}
                                <div className="space-y-3" >
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
            </main>

        </>
    )
}
export default Home;
