import { useState } from "react"
import NewAppForm from "../../components/NewAppForm"
import Button from 'react-bootstrap/Button'
import ApplicationTable from "../../components/ApplicationTable"


const Applications = () => {
    const [formActive, setFormActive] = useState(false)
    
    const handleNewClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setFormActive(prevState => !prevState)
    }

    return (
        <div className="container py-4 px-3 mx-auto">
            <h1 className='text-center' >Your Applications</h1>
            {formActive ? <>
                <div className="container mt-3">
                    <Button variant="outline-dark" onClick={handleNewClick}>
                        Cancel
                    </Button>
                </div>
                <NewAppForm setFormActive={setFormActive} />
            </>:<>
                <div className="container mt-3">
                    <Button variant="outline-dark" onClick={handleNewClick}>
                        New Applicaiton
                    </Button>
                </div>
                <ApplicationTable />
            </>}
        </div>
    )
}

export default Applications