interface AuthImageSectionProps {
  imageSrc: string
  title: string
  description: string
  altText?: string
}

export const AuthImageSection = ({ imageSrc, title, description, altText = "Auth image" }: AuthImageSectionProps) => {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white">
      <div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">{title}</h1>
        <p className="text-green-100 text-lg">{description}</p>
      </div>

      <div className="relative w-full h-96 -mb-8">
        <img
          src={ "/eco-bag.png"}
          alt={altText}
          className="absolute inset-0 w-full h-full object-contain object-center"
        />
      </div>
    </div>
  )
}
