// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BuilderRegistry {
    struct Builder {
        uint256 fid;
        string username;
        string bio;
        string[] skills;
        address wallet;
        uint256 registeredAt;
        bool active;
    }

    struct Project {
        uint256 id;
        uint256 ownerFid;
        string title;
        string metadataUri; // IPFS or Supabase URL with full plan JSON
        uint256 publishedAt;
    }

    // fid => Builder
    mapping(uint256 => Builder) private builders;
    uint256[] private builderFids;

    // projectId => Project
    mapping(uint256 => Project) private projects;
    uint256 private nextProjectId;

    // fid => projectIds
    mapping(uint256 => uint256[]) private projectsByBuilder;

    event BuilderRegistered(uint256 indexed fid, string username, address wallet);
    event BuilderUpdated(uint256 indexed fid);
    event ProjectPublished(uint256 indexed projectId, uint256 indexed ownerFid, string title);

    error AlreadyRegistered();
    error NotRegistered();
    error Unauthorized();
    error InvalidFid();

    function register(
        uint256 fid,
        string calldata username,
        string calldata bio,
        string[] memory skills,
        address wallet
    ) external {
        if (fid == 0) revert InvalidFid();
        if (builders[fid].registeredAt != 0) revert AlreadyRegistered();

        builders[fid] = Builder({
            fid: fid,
            username: username,
            bio: bio,
            skills: skills,
            wallet: wallet,
            registeredAt: block.timestamp,
            active: true
        });

        builderFids.push(fid);
        emit BuilderRegistered(fid, username, wallet);
    }

    function update(
        uint256 fid,
        string calldata bio,
        string[] memory skills
    ) external {
        if (builders[fid].registeredAt == 0) revert NotRegistered();
        if (builders[fid].wallet != msg.sender) revert Unauthorized();

        builders[fid].bio = bio;
        builders[fid].skills = skills;
        emit BuilderUpdated(fid);
    }

    function publishProject(
        uint256 ownerFid,
        string calldata title,
        string calldata metadataUri
    ) external returns (uint256 projectId) {
        if (builders[ownerFid].registeredAt == 0) revert NotRegistered();
        if (builders[ownerFid].wallet != msg.sender) revert Unauthorized();

        projectId = nextProjectId++;
        projects[projectId] = Project({
            id: projectId,
            ownerFid: ownerFid,
            title: title,
            metadataUri: metadataUri,
            publishedAt: block.timestamp
        });
        projectsByBuilder[ownerFid].push(projectId);

        emit ProjectPublished(projectId, ownerFid, title);
    }

    // --- Views ---

    function getBuilder(uint256 fid) external view returns (Builder memory) {
        if (builders[fid].registeredAt == 0) revert NotRegistered();
        return builders[fid];
    }

    function isRegistered(uint256 fid) external view returns (bool) {
        return builders[fid].registeredAt != 0;
    }

    function getAllBuilders() external view returns (Builder[] memory) {
        uint256 count = builderFids.length;
        Builder[] memory result = new Builder[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = builders[builderFids[i]];
        }
        return result;
    }

    function getActiveBuilders() external view returns (Builder[] memory) {
        uint256 total = builderFids.length;
        uint256 activeCount;
        for (uint256 i = 0; i < total; i++) {
            if (builders[builderFids[i]].active) activeCount++;
        }
        Builder[] memory result = new Builder[](activeCount);
        uint256 idx;
        for (uint256 i = 0; i < total; i++) {
            if (builders[builderFids[i]].active) {
                result[idx++] = builders[builderFids[i]];
            }
        }
        return result;
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }

    function getProjectsByBuilder(uint256 fid) external view returns (Project[] memory) {
        uint256[] memory ids = projectsByBuilder[fid];
        Project[] memory result = new Project[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = projects[ids[i]];
        }
        return result;
    }

    function builderCount() external view returns (uint256) {
        return builderFids.length;
    }
}
