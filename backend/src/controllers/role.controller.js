import { RoleModel } from "../models/role.model.js";

const createRole = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (role) {
            return res.status(409).json({ message: "Role already exists" });
        }

        const newRole = await RoleModel.createRole(nombre);
        return res.json({ ok: true, message: "New role created", role: newRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const findRoleByName = async (req, res) => {
    try {
        const { nombre } = req.params;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        return res.json({ ok: true, role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateRole = async (req, res) => {
    try {
        const { nombre } = req.params;
        const { newName } = req.body;

        if (!nombre || !newName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        const updatedRole = await RoleModel.updateRole(nombre, newName);
        return res.json({ ok: true, message: "Role updated", role: updatedRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { nombre } = req.params;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        await RoleModel.deleteRole(nombre);
        return res.json({ ok: true, message: "Role deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const roleController = {
    createRole,
    findRoleByName,
    updateRole,
    deleteRole
};
