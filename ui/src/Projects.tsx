import { useEffect, useState } from 'react';
import { Badge, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { Api, Project } from './Api';
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs';
import { ChangeProject, NewProject } from './ProjectEditor';


interface ProjectListProps {
    projects: Project[]
    saveProject: (project: Project) => void
    deleteProject: (project: Project) => void
}


interface ProjectListEntryProps {
    project: Project
    saveProject: (project: Project) => void
    deleteProject: (project: Project) => void
}

const ProjectListEntry = (p: ProjectListEntryProps) => {
    const [showDialog, setShowDialog] = useState(false)
    return <ListGroup.Item>
        <Row>
            <Col>
                <div className='fw-bold'>{p.project.name} <span className="pl-3" />
                    {p.project.isActive ?
                        <Badge bg="primary">Active</Badge> :
                        <Badge bg="secondary">Inactive</Badge>}
                </div>
                {p.project.jobNumbers.map(jn => <div key={jn.jobNumber}>{jn.jobNumber}
                    <small className='p-3'>{(jn.startDate !== undefined) ? jn.startDate + " - " +
                        ((jn.endDate !== undefined) ? jn.endDate : "") : ""}</small></div>)}
            </Col>
            <ChangeProject project={p.project}
                saveProject={p.saveProject}
                show={showDialog}
                hide={() => setShowDialog(false)} />
            <Col className="me-auto col-auto">
                <Row className="p-2"><BsFillPencilFill onClick={() => setShowDialog(true)} /></Row>
                <Row className="p-2"><BsFillTrashFill onClick={() => p.deleteProject(p.project)} /></Row>
            </Col>
        </Row>
    </ListGroup.Item>
}

const ProjectList = ({ projects, saveProject, deleteProject }: ProjectListProps) => {
    return <Container className='pt-3 me-auto'>
        <ListGroup>
            {projects.map(p => <ProjectListEntry key={p.projectId}
                project={p} saveProject={saveProject} deleteProject={deleteProject} />)}
        </ListGroup>
    </Container>
}

const Projects = () => {
    const [projects, setProjects] = useState<Array<Project>>([]);

    function newProjectIsValid(project: Project) {
        const uniqueId = projects.filter(p => p.name === project.name
            || p.projectId === project.projectId).length === 0
        const nonEmpty = project.projectId !== undefined
            && project.projectId !== ""
            && project.name !== undefined
            && project.name !== ""
        return uniqueId && nonEmpty
    }

    function updateProjects() {
        Api.getProjects().then((s) => setProjects(s))
    }

    function saveProject(project: Project) {
        Api.addOrUpdateProject(project).then(
            () => updateProjects(),
            (err) => console.error(err)
        )
    }

    function deleteProject(project: Project) {
        Api.deleteProject(project.projectId).then(
            () => updateProjects(),
            (err) => console.error(err))
    }

    useEffect(() => {
        updateProjects()
    }, [])

    return <Container className='p-4'>
        <NewProject saveProject={saveProject} isValid={newProjectIsValid} />
        <ProjectList projects={projects} saveProject={saveProject} deleteProject={deleteProject} />
    </Container>
}

export default Projects
