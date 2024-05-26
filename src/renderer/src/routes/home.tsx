import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import hero from '../assets/hero.svg?asset'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hospital, Plus } from 'lucide-react'
import { useSettings } from '@renderer/contexts/SettingsContext'

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
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { settings } = useSettings()

  const handleSearch = () => {
    navigate(`/patients?q=${search}`)
  }

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="flex text-8xl font-extrabold items-center justify-center">OpNotes</h1>
      {settings && (
        <div className="mt-4 flex flex-col justify-center items-center">
          <div className="text-xl text-secondary-foreground/80">{settings['hospital']}</div>
          <div className="text-lg text-secondary-foreground/60">{settings['unit']}</div>
        </div>
      )}
      <img src={hero} alt="hero" className="w-96 h-96" />
      <div className="pt-5 w-full max-w-md flex flex-col md:flex-row gap-1 md:gap-0 justify-center items-center">
        <Input
          type="text"
          placeholder="Search Patients By PHN, BHT, Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button className="ml-2" variant="default" leftIcon={<SearchIcon />} onClick={handleSearch}>
          Search
        </Button>
      </div>
      <div className="flex flex-col md:flex-row w-full justify-center items-center md:space-x-2">
        <Button
          className="mt-2"
          variant="secondary"
          size={'sm'}
          onClick={() => navigate('/patients/add')}
        >
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
        <Button
          className="mt-2"
          variant="secondary"
          size={'sm'}
          onClick={() => navigate('/surgeries')}
        >
          <Hospital className="h-4 w-4" />
          View All Surgeries
        </Button>
      </div>
    </div>
  )
}
