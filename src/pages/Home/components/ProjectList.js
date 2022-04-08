import { Link } from "react-router-dom";

export default function ProjectList({ projects }) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {projects.map((project) => (
        <li
          key={project.id}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow-lg divide-y divide-gray-200"
        >
          <div className="flex-1 flex flex-col p-8">
            <div
              className="w-32 h-32 flex-shrink-0 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded"
              alt=""
            />
            <h3 className="mt-6 text-gray-900 text-sm font-medium">
              {project.name}
            </h3>
            <dl className="mt-1 flex-grow flex flex-col justify-between">
              <dt className="sr-only">Title</dt>
              <dd className="text-gray-500 text-sm">{project.geolist}</dd>
              <dt className="sr-only">Role</dt>
              <dd className="mt-3">
                <span className="px-2 py-1 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                  {project.options}
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="w-0 flex-1 flex">
                <Link
                  to={`/project/${project.id}/settings`}
                  className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                >
                  <span className="ml-3">Settings</span>
                </Link>
              </div>
              <div className="-ml-px w-0 flex-1 flex">
                <Link
                  to={`/project/${project.id}`}
                  className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                >
                  <span className="ml-3">View</span>
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
