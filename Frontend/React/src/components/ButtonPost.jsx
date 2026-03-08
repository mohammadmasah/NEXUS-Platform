
function ButtonPost ({ Arg, type = "button", className = "", onClick }) {
    const baseStyle = "transition-all active:scale-95 cursor-pointer";

    return (
        <button 
            type={type} 
            className={`${baseStyle} ${className}`} 
            onClick={onClick}
        > 
            {Arg} 
        </button>
    );
}

export default ButtonPost;
