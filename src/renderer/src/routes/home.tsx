import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import hero from '../assets/hero.svg'

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
)

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="flex text-5xl font-extrabold items-center justify-center">OpNotes</h1>
      <img src={hero} alt="hero" className="w-96 h-96" />
      <div className="pt-5 w-full max-w-md flex justify-center items-center">
        <Input type="text" placeholder="Search By PHN, BHT, Pt Name..." />
        <Button className="ml-2" variant="default">
          <SearchIcon />
          Search
        </Button>
      </div>
    </div>
  )
}
