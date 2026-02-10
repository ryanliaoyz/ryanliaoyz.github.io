import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BASE_DIR = path.join(process.cwd(), "blog");

