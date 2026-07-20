function Dashboard() {
  return (
    <div className="dashboard">

      <nav
        className="
        navbar
        navbar-dark
        bg-dark
        px-4
      "
      >
        <span className="navbar-brand">
          Interview Management
        </span>
      </nav>

      <div className="container mt-5">

        <h2 className="mb-4">
          Dashboard Overview
        </h2>

        <div className="row">

          <div className="col-md-3 mb-3">
            <div className="card card-tile shadow-sm">
              <div className="card-body">
                <h6>
                  Candidates
                </h6>
                <div className="stat-number">
                  42
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card card-tile shadow-sm">
              <div className="card-body">
                <h6>
                  Interviews
                </h6>
                <div className="stat-number">
                  18
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card card-tile shadow-sm">
              <div className="card-body">
                <h6>
                  Completed
                </h6>
                <div className="stat-number">
                  11
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card card-tile shadow-sm">
              <div className="card-body">
                <h6>
                  Pending
                </h6>
                <div className="stat-number">
                  7
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;