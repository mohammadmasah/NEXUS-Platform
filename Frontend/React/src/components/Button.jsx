function Button ({Arg, type = "submit", className = "bg-black w-1/2 text-white"}) {

    return (
        <button type={type} className={className}> {Arg} </button>
    )
}

export default Button;