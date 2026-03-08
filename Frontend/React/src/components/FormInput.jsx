function FormInput ({ className = "bg-black text-white", type, value, onChange}) {
    return (
        <input className={className} type={type} value={value} onChange={onChange}></input>
    )
}

export default FormInput;