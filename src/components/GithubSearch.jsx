import { useMemo, useState } from "react";
import axios from "axios";
import {
  FaStar,
  FaCodeBranch,
  FaMoon,
  FaSun,
  FaCopy,
  FaGithub,
} from "react-icons/fa";

const GithubSearch = () => {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dark, setDark] = useState(true);
  const [repoQuery, setRepoQuery] = useState("");
  const [showStarOnly, setShowStarOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ---------------- API ---------------- */

  const fetchRepos = async (user) => {
    const res = await axios.get(
      `https://api.github.com/users/${user}/repos`,
      { params: { per_page: 100, sort: "updated" } }
    );
    return res.data;
  };

  /* ---------------- SEARCH ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      const userRes = await axios.get(
        `https://api.github.com/users/${username}`
      );
      const repoData = await fetchRepos(username);

      setProfile(userRes.data);
      setRepos(repoData);
      setShowStarOnly(false);
    } catch {
      setError("❌ GitHub user not found");
    } finally {
      setLoading(false);
    }
  };

  const copyProfile = () => {
    navigator.clipboard.writeText(profile.html_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* ---------------- FILTER ---------------- */

  const filteredRepos = useMemo(() => {
    let data = repos.filter((repo) =>
      repo.name.toLowerCase().includes(repoQuery.toLowerCase())
    );

    if (showStarOnly) {
      data = data.filter((repo) => repo.stargazers_count > 0);
    }

    return data.sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );
  }, [repos, repoQuery, showStarOnly]);

  const totalStarRepos = repos.filter(
    (repo) => repo.stargazers_count > 0
  ).length;

  /* ---------------- UI ---------------- */

  return (
    <div
      className={`min-h-screen transition ${
        dark
          ? "bg-linear-to-br from-gray-900 via-black to-gray-800 text-white"
          : "bg-gray-100 text-gray-900"
      } px-4 py-10`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl max-[375px]:text-3xl font-bold">
            GitHub Profile Detective 🔍
          </h1>

          <button
            onClick={() => setDark(!dark)}
            className="p-3  rounded-full bg-blue-600 text-white cursor-pointer"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Enter GitHub username..."
            className={`flex-1 text-black px-4 py-3 rounded-lg border outline-none
              ${
                dark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button className="px-6 py-3 bg-blue-600 rounded-lg text-white cursor-pointer">
            Search
          </button>
        </form>

        {loading && (
          <p className="text-center text-blue-400 animate-pulse">
            Loading...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* Profile */}
        {profile && (
          <div 
          className={`rounded-xl p-6 mb-10 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-700'}`}>
            <div className="flex flex-col sm:flex-row gap-6 sm:text-left items-center sm:items-start">
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-500"
              />

              <div className="flex-2">
                <div className="flex flex-col min-[426px]:flex-row min-[426px]:justify-between min-[426px]:items-center gap-3">
                  <h2 className="text-2xl font-bold break-all">
                    {profile.name || profile.login}
                  </h2>
                  <button
                    onClick={copyProfile}
                    className="flex text-white items-center justify-center gap-2 px-3 py-2 bg-blue-600 rounded text-sm w-full min-[426px]:w-auto cursor-pointer"
                  >
                    <FaCopy />
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                </div>

                <p className={`${dark ? 'text-gray-400' : 'text-gray-900'} mt-2`}>
                  {profile.bio || "No bio available"}
                </p>

                {/* Stats */}
                <div className="flex gap-4 mt-4 text-sm">
                  <span>📦 Total Repos: {profile.public_repos}</span>
                  <span>⭐ Star Repos: {totalStarRepos}</span>
                </div>

                {/* View Profile */}
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 rounded text-sm text-white"
                >
                  <FaGithub /> View Profile
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Repo Controls */}
        {repos.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search repository..."

              className={`flex-1 px-4 py-2 rounded border ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-300'}`}

              value={repoQuery}
              onChange={(e) => setRepoQuery(e.target.value)}
            />

            <button
              onClick={() => setShowStarOnly(!showStarOnly)}
              className={`px-4 py-2 rounded ${
                showStarOnly
                  ? "bg-yellow-500 text-black"
                  : "bg-blue-600 text-white"
              }`}
            >
              ⭐ Star Repos
            </button>
          </div>
        )}

        {/* Repos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className={` border border-gray-700 rounded-xl p-5 hover:border-blue-500 transition ${dark? 'bg-gray-900' : 'bg-white'}`}
            >
              <h3 className="font-semibold text-lg mb-2">
                {repo.name}
              </h3>

              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {repo.description || "No description"}
              </p>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <FaStar /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <FaCodeBranch /> {repo.forks_count}
                </span>
                <span>{repo.language}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GithubSearch;
