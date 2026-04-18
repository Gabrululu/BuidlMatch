// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BuilderRegistry.sol";

contract BuilderRegistryTest is Test {
    BuilderRegistry registry;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant FID_ALICE = 1001;
    uint256 constant FID_BOB = 1002;

    string[] aliceSkills;
    string[] bobSkills;

    function setUp() public {
        registry = new BuilderRegistry();
        aliceSkills.push("Solidity");
        aliceSkills.push("Frontend");
        bobSkills.push("GTM");
        bobSkills.push("Design");
    }

    // --- register ---

    function test_register_success() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "Builder from Lima", aliceSkills, alice);

        BuilderRegistry.Builder memory b = registry.getBuilder(FID_ALICE);
        assertEq(b.fid, FID_ALICE);
        assertEq(b.username, "alice.eth");
        assertEq(b.wallet, alice);
        assertEq(b.skills[0], "Solidity");
        assertTrue(b.active);
    }

    function test_register_emits_event() public {
        vm.expectEmit(true, false, false, true);
        emit BuilderRegistry.BuilderRegistered(FID_ALICE, "alice.eth", alice);
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);
    }

    function test_register_reverts_duplicate() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.prank(alice);
        vm.expectRevert(BuilderRegistry.AlreadyRegistered.selector);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);
    }

    function test_register_reverts_zero_fid() public {
        vm.expectRevert(BuilderRegistry.InvalidFid.selector);
        registry.register(0, "zero", "bio", aliceSkills, alice);
    }

    function test_isRegistered() public {
        assertFalse(registry.isRegistered(FID_ALICE));
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);
        assertTrue(registry.isRegistered(FID_ALICE));
    }

    // --- update ---

    function test_update_success() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "old bio", aliceSkills, alice);

        string[] memory newSkills = new string[](1);
        newSkills[0] = "DeFi";

        vm.prank(alice);
        registry.update(FID_ALICE, "new bio", newSkills);

        BuilderRegistry.Builder memory b = registry.getBuilder(FID_ALICE);
        assertEq(b.bio, "new bio");
        assertEq(b.skills[0], "DeFi");
    }

    function test_update_reverts_unauthorized() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.prank(bob);
        vm.expectRevert(BuilderRegistry.Unauthorized.selector);
        registry.update(FID_ALICE, "hacked", bobSkills);
    }

    function test_update_reverts_not_registered() public {
        vm.prank(alice);
        vm.expectRevert(BuilderRegistry.NotRegistered.selector);
        registry.update(9999, "bio", aliceSkills);
    }

    // --- getAllBuilders / getActiveBuilders ---

    function test_getAllBuilders() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);
        vm.prank(bob);
        registry.register(FID_BOB, "bob.eth", "bio", bobSkills, bob);

        BuilderRegistry.Builder[] memory all = registry.getAllBuilders();
        assertEq(all.length, 2);
        assertEq(registry.builderCount(), 2);
    }

    function test_getActiveBuilders_only_active() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);
        vm.prank(bob);
        registry.register(FID_BOB, "bob.eth", "bio", bobSkills, bob);

        BuilderRegistry.Builder[] memory active = registry.getActiveBuilders();
        assertEq(active.length, 2);
    }

    // --- publishProject ---

    function test_publishProject_success() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.prank(alice);
        uint256 pid = registry.publishProject(FID_ALICE, "DeFi Latam", "ipfs://Qm123");

        BuilderRegistry.Project memory p = registry.getProject(pid);
        assertEq(p.ownerFid, FID_ALICE);
        assertEq(p.title, "DeFi Latam");
        assertEq(p.metadataUri, "ipfs://Qm123");
    }

    function test_publishProject_emits_event() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.expectEmit(true, true, false, true);
        emit BuilderRegistry.ProjectPublished(0, FID_ALICE, "DeFi Latam");

        vm.prank(alice);
        registry.publishProject(FID_ALICE, "DeFi Latam", "ipfs://Qm123");
    }

    function test_publishProject_reverts_not_registered() public {
        vm.prank(alice);
        vm.expectRevert(BuilderRegistry.NotRegistered.selector);
        registry.publishProject(9999, "x", "ipfs://x");
    }

    function test_publishProject_reverts_unauthorized() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.prank(bob);
        vm.expectRevert(BuilderRegistry.Unauthorized.selector);
        registry.publishProject(FID_ALICE, "x", "ipfs://x");
    }

    function test_getProjectsByBuilder() public {
        vm.prank(alice);
        registry.register(FID_ALICE, "alice.eth", "bio", aliceSkills, alice);

        vm.startPrank(alice);
        registry.publishProject(FID_ALICE, "Project A", "ipfs://A");
        registry.publishProject(FID_ALICE, "Project B", "ipfs://B");
        vm.stopPrank();

        BuilderRegistry.Project[] memory projs = registry.getProjectsByBuilder(FID_ALICE);
        assertEq(projs.length, 2);
        assertEq(projs[0].title, "Project A");
        assertEq(projs[1].title, "Project B");
    }
}
