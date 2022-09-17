import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { JobNumber, Project } from './Api';
import { JobNumberList } from './Jobnumbers';

interface ProjectEditProps {
    project: Project
    updateProject: (p: Project) => void
    editId: boolean
}

interface NewProjectProps {
    saveProject: (project: Project) => void
    isValid: (project: Project) => boolean
}

interface ChangeProjectProps {
    project: Project
    saveProject: (project: Project) => void
    show: boolean
    hide: () => void
}

const ProjectEditDialog = ({ project, updateProject, editId }: ProjectEditProps) => {
    function updateId(id: string) {
        updateProject(Object.assign({}, project, { projectId: id }))
    }
    function updateName(name: string) {
        updateProject(Object.assign({}, project, { name: name }))
    }
    function updateIsActive(isActive: boolean) {
        updateProject(Object.assign({}, project, { isActive: isActive }))
    }
    function updateJobNumbers(jobNumbers: JobNumber[]) {
        updateProject(Object.assign({}, project, { jobNumbers: jobNumbers }))
    }
    function updateChargeable(isChargeable: boolean) {
        updateProject(Object.assign({}, project, { isChargeable: isChargeable }))
    }

    return <>
        <Form>
            {editId ? <Form.Group>
                <Form.Label>Project ID</Form.Label>
                <Form.Control type="text" value={project.projectId} onChange={(s) => updateId(s.target.value)} />
            </Form.Group> : <></>}

            <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" value={project.name} onChange={(s) => updateName(s.target.value)} />
            </Form.Group>

            <Row>
                <Col>
                    <Form.Group className="pt-2">
                        <Form.Check type="switch" label="Is Active" checked={project.isActive} onChange={s => updateIsActive(s.target.checked)} />
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group className="pt-2">
                        <Form.Check type="switch" label="Is Chargeable" checked={project.isChargeable} onChange={s => updateChargeable(s.target.checked)} />
                    </Form.Group>
                </Col>
            </Row>

            <JobNumberList jobNumbers={project.jobNumbers} updateJobNumbers={updateJobNumbers} />
        </Form>
    </>
}

export const NewProject = ({ saveProject, isValid }: NewProjectProps) => {
    const newProjectTemplate = {
        projectId: "",
        name: "",
        jobNumbers: [],
        isActive: false,
        isChargeable: false
    }
    const [show, setShow] = useState(false);
    const [newProject, setNewProject] = useState<Project>(Object.assign({}, newProjectTemplate));

    function save() {
        saveProject(newProject)
        setNewProject(Object.assign({}, newProjectTemplate))
        setShow(false)
    }

    return <>
        <Row>
            <Col>
                <Button onClick={() => setShow(true)}>New Project</Button>
            </Col>
        </Row>

        <Modal show={show} onHide={() => setShow(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>New Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ProjectEditDialog project={newProject} updateProject={setNewProject} editId={true} />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={save} disabled={!isValid(newProject)}>Save</Button>
                <Button variant="secondary" onClick={() => setShow(false)} >Close</Button>
            </Modal.Footer>
        </Modal>
    </>
}

export const ChangeProject = ({ project, saveProject, show, hide }: ChangeProjectProps) => {
    const [editedProject, setEditedProject] = useState(Object.assign({}, project))
    return <Modal show={show} onHide={hide} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ProjectEditDialog project={editedProject} updateProject={setEditedProject} editId={false} />
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={() => { saveProject(editedProject); hide() }}>Save</Button>
            <Button variant="secondary" onClick={hide} >Close</Button>
        </Modal.Footer>
    </Modal>
}
